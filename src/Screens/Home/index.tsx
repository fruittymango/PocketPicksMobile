/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState, createContext, useContext, useCallback, useRef, } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Linking,
  FlatList,
  ImageBackground,
  Modal,
  Share,
  Image,
  useWindowDimensions,
  Animated
} from 'react-native';
import {StatusBarStyle, TextStyle, ViewStyle, ImageStyle, ActivityIndicator} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { mockdata } from '../../Models/MockData';
import { ICatergoryItem, IGenre } from '../../Models';
import { addToFavouritesList, addToWatchNextList, existsInFavouriteList, existsInWatchNextList, removeFromFavouriteList, removeFromToWatchNextList } from '../../Storage';

type CatergoryItemModalContextType = {

  modalContextData: ICatergoryItem | {};
  setModalContextData: (value:ICatergoryItem) => void ;
  modalVisible: boolean;
  setModalVisible: (value:boolean)=>void;

  genre:string;
  setGenre: (value: string) => void;
  genreUrl: string;
  setGenreUrl: (value: string) => void;
  genreModalVisibility: boolean;
  setGenreModalVisibility: (value:boolean) => void;

  modalTitle: string;
  setModalTitle: (value: string) => void ;
  modalContextItems: Array<ICatergoryItem> | [];
  setModalContexItems: (value:Array<ICatergoryItem>) => void ;
  viewAll: boolean;
  setViewAll: (value:boolean)=>void;
};

export const CatergoryItemModalContext = createContext<CatergoryItemModalContextType | {}>({});

const Colors = {
  primaryTextColor: '#F3F3F4',
  secondaryTextColor: '#979797',
  actionableTxtColor: '#E82251',
  activeButtonBgColor: '#D72C55',
  primaryBgColor: '#0A1823',
  secondaryBgColor: '#222E3E',
};

type RootStackParamList = {
  Home: { userId: string } | undefined;
  MyList: { userId: string } | undefined;
  Profile: { userId: string } | undefined;
  Notifications: { userId: string } | undefined;
};

type HomeProps = BottomTabScreenProps<RootStackParamList, 'Home'>;

type TActiveTitle = {
  title: string;
  active?: boolean;
};

type DropDownProps = {
  list: Array<TActiveTitle>;
  setList: (newList:Array<TActiveTitle>)=>void;
  style?: ViewStyle;
};

const DropDown = ({list, setList}:DropDownProps) => {
  const [active, setActive] = useState(false);
  return (
    <>
      
      <Pressable onPress={()=>setActive(true)} style={{display:'flex', flexDirection:'row', alignItems:'center', columnGap:10, }}>
          <Text style={{fontSize:25, color:Colors.primaryTextColor}}>{`${list.filter((item:TActiveTitle, itemIndex:number)=>item.active)[0].title}`}</Text>
          <MaterialCommunityIcons name="chevron-down" color={Colors.primaryTextColor} size={25}/>
      </Pressable>
      {active?
      <View style={{position:'absolute', height:'auto', width:200, backgroundColor:Colors.primaryBgColor,
      marginVertical:10, 
      marginTop:15,
      padding:10, paddingHorizontal:0, zIndex:1
      }}>
        <View>
          {
            list.map((value:TActiveTitle, index:number)=> <Pressable 
            style={{display:'flex', flexDirection:'row', alignItems:'center', 
            paddingVertical: 10,paddingHorizontal:15,backgroundColor:value.active? Colors.secondaryBgColor:''}}
            key={index} onPress={()=>{
              setList(
                list.map((item:TActiveTitle, itemIndex:number)=>{
                  if (item.title===value.title) {
                    item.active = true;
                  } else {
                    item.active = false;
                  }
                  return item
                })
              );
              setActive(false);
            }}><Text style={{fontSize:20, color:value.active? Colors.primaryTextColor: Colors.secondaryTextColor}}>{value.title}</Text></Pressable>)
          }
        </View>
      </View>
      : null
      }
    </>
  );
}

type ContentHeaderProps = {
  style?: ViewStyle;
  state: boolean;
  handleState: (value: boolean)=>void; 
};

const ContentHeader = ({style, state, handleState}:ContentHeaderProps)=> {
  const {height, width} = useWindowDimensions();

  return(
    <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', paddingVertical: height > width ? 25: 10, paddingHorizontal: 15, marginBottom: height > width ? 15: 5,
     ...style,}}>
      <View>
        <Text style={{fontSize:25, color:Colors.primaryTextColor, fontWeight:'600'}}>POCKET</Text>
        <Text style={{fontSize:22, color:Colors.primaryTextColor, fontWeight:'400', letterSpacing:9}}>`ICKS</Text>
      </View>
      
      <View style={{display:'flex', flexDirection:'row', columnGap:15, width: '25%', justifyContent:'flex-end', alignSelf:'center' }}>
        <Pressable
          onPress={()=>handleState(!state)}
        >
        <MaterialIcons name="switch-access-shortcut" color={Colors.primaryTextColor} size={40} />
        </Pressable>
      </View>
    </View>
  );
}

type CarouselProps = {
    style?: ViewStyle;
    CategoryItems?: Array<ICatergoryItem>;
};

type BannerCarouselProps = {
  style?: ViewStyle;
  tv?:boolean;
  movies?:boolean;
};

function BannerCarousel({style, tv, movies}: BannerCarouselProps): React.JSX.Element {
  const {height, width} = useWindowDimensions();

  const {
    modalContextData, setModalContextData, setViewAll, viewAll, modalVisible, setModalVisible,
    modalTitle, setModalTitle, modalContextItems, setModalContexItems
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<Array<ICatergoryItem> | []>([]);

  async function doGet(){
    setLoading(true);
    try {
      let url = '';
      if (tv!== undefined){
      url = 'https://api.themoviedb.org/3/trending/tv/day?language=en-US';
      }

      if (movies!== undefined) {
      url = 'https://api.themoviedb.org/3/trending/movie/day?language=en-US';
      }

      const result = await fetch(url, {
        headers:{
          'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYWViYWExMWM5ZTg1NmExMmI4ZWUyYTEyZTUxZWQxYyIsInN1YiI6IjY1Mjk1Yzc2NTQ0YzQxMGRkN2IxYWM3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fO0zhjg8J99-ga6CwwuSZpnYwTT1F6x6SiQIf8Gb_5E',
          'content-type': 'application/json'
        }
      });
      const temp = await result.json();
      setItems(temp?.results);
    } catch (error) {
        console.log({error});
        setError(true);
    }
    setLoading(false)
  }
  useEffect(()=>{
    doGet();
  },[]);

  return(
    <>
    {loading?
      <View style={{height:height>width? 0.20*height: 0.23*width, 
        alignItems:'center', paddingHorizontal:15,marginVertical:10, ...style}}>
        <ActivityIndicator/>
      </View>
    : error?
      <View style={{height:height>width? 0.20*height: 0.23*width, 
        alignItems:'center', paddingHorizontal:15,marginVertical:10,display:'flex', flexDirection:'row', justifyContent:'space-between', ...style}}>
        <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Error Occured</Text>
        <Pressable
          onPress={()=>doGet()}
        >
          <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>Retry</Text>
        </Pressable>
      </View>
    :
      <FlatList
      horizontal
      initialNumToRender={5}
      showsHorizontalScrollIndicator={false}
      bounces={false}
      data={items}
      scrollToOverflowEnabled
      contentContainerStyle={{
        height:height>width? 0.20*height: 0.23*width, 
        alignItems:'center', paddingHorizontal:15,marginVertical:10, ...style}}
      contentOffset = {{x: height>width?0.875*width : 0.57*width, y: 0}}
      renderItem={value=>{
          const image = {uri: `https://image.tmdb.org/t/p/original${value.item?.backdrop_path || '' }`};   
          return(
          <Pressable 
            style={{marginRight: 15,}}
            onPress={()=>{
              setModalContextData(value.item);
              setModalVisible(!modalVisible);
            }}
          >
            <ImageBackground
              resizeMode='cover'source={image} style={{
              width: height>width? 0.86*width: height,
              height:height>width? 0.20*height: 0.23*width,}} imageStyle={{borderRadius:16,}}
              />
              
          </Pressable>
          );
      }}
      keyExtractor={item => ''+item.id}/>
    }
    </>
);
}

type GenreCarouselProps = {
    style?: ViewStyle;
    catergory: string;
};

function GenreCarousel({style, catergory}: GenreCarouselProps): React.JSX.Element{
  const {height, width} = useWindowDimensions();
  const {
    genre,
    setGenre,
    genreUrl,
    setGenreUrl,
    genreModalVisibility,
    setGenreModalVisibility
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<Array<ICatergoryItem> | []>([]);

  async function doGet(){
    setLoading(true);
    try {
      const url = `https://api.themoviedb.org/3/genre/${catergory}/list?language=en`;
      const result = await fetch(url, {
        headers:{
          'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYWViYWExMWM5ZTg1NmExMmI4ZWUyYTEyZTUxZWQxYyIsInN1YiI6IjY1Mjk1Yzc2NTQ0YzQxMGRkN2IxYWM3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fO0zhjg8J99-ga6CwwuSZpnYwTT1F6x6SiQIf8Gb_5E',
          'content-type': 'application/json'
        }
      });
      const temp = await result.json();
      setItems(temp?.genres);
    } catch (error) {
        console.log({error});
        setError(true);
    }
    setLoading(false)
  }
  useEffect(()=>{
    doGet();
  },[]);

    return(
        <View style={{height:height>width? 0.15*height:0.15*width , padding:15, paddingVertical:5}}>
        {
            loading?
              <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'center',paddingBottom:15}}>
                <ActivityIndicator/>
              </View>
            : error?
              <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'space-between',paddingBottom:15}}>
                <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Error Occured</Text>
                <Pressable
                  onPress={()=>doGet()}
                >
                  <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>Retry</Text>
                </Pressable>
              </View>
            :
            <>
              <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Genres</Text>
              <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  bounces={false}
                  data={items}
                  scrollToOverflowEnabled
                  contentContainerStyle={{alignItems:'center',}}
                  initialNumToRender={5}
                  renderItem={value=>{
                  return(
                      <Pressable 
                      onPress={()=>{
                        const url = `https://api.themoviedb.org/3/discover/${catergory}?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${value.item.id}`;

                        setGenre(value?.item.name || '');
                        setGenreUrl(url);
                        setGenreModalVisibility(!genreModalVisibility);

                      }}
                      style={{
                          marginRight:20,
                          borderRadius:16,
                          paddingHorizontal:10,
                          paddingVertical:5,
                          borderColor: Colors.secondaryTextColor,
                          borderWidth:1
                          
                      }}>
                      <Text style={{color:Colors.secondaryTextColor}}>{value.item.name}</Text>
                      </Pressable>
                  );
                  }}
                  keyExtractor={item => ''+item.id}/>
            </>
          }

        </View>
    );
}

function TrendingMoviesCarousel({style}: CarouselProps): React.JSX.Element{
  const {
    modalContextData, setModalContextData, setViewAll, viewAll, modalVisible, setModalVisible,
    modalTitle, setModalTitle, modalContextItems, setModalContexItems
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;
  const {height, width} = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<Array<ICatergoryItem> | []>([]);

  async function doGet(){
    setLoading(true);
    try {
      const url = 'https://api.themoviedb.org/3/trending/movie/day?language=en-US';
      const result = await fetch(url, {
        headers:{
          'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYWViYWExMWM5ZTg1NmExMmI4ZWUyYTEyZTUxZWQxYyIsInN1YiI6IjY1Mjk1Yzc2NTQ0YzQxMGRkN2IxYWM3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fO0zhjg8J99-ga6CwwuSZpnYwTT1F6x6SiQIf8Gb_5E',
          'content-type': 'application/json'
        }
      });
      const temp = await result.json();
      setItems(temp?.results);
    } catch (error) {
        console.log({error});
        setError(true);
    }
    setLoading(false)
  }
  useEffect(()=>{
    doGet();
  },[]);

    return(
        <View style={{height: height>width ? 0.37*height: 0.35*width, paddingHorizontal:15, marginVertical:10}}>
          {
            loading?
              <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'center',paddingBottom:15}}>
                <ActivityIndicator/>
              </View>
            : error?
              <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'space-between',paddingBottom:15}}>
                <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Error Occured</Text>
                <Pressable
                  onPress={()=>doGet()}
                >
                  <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>Retry</Text>
                </Pressable>
              </View>
            :<>
                <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'space-between',paddingBottom:15}}>
                    <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Trending Movies</Text>
                    <Pressable
                      onPress={()=>{
                        setModalTitle('Trending Movies');
                        setModalContexItems(items);
                        setViewAll(!viewAll);
                      }}
                    >
                      <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>View all</Text>
                    </Pressable>
                </View>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    data={items}
                    contentContainerStyle={{
                      height: height>width ? 0.30*height: 0.27*width
                    }}
                    initialNumToRender={5}
                    renderItem={value=>{
                      const image = {uri: `https://image.tmdb.org/t/p/original${value.item?.poster_path || '' }`};   
                    return(
                      <Pressable 
                        onPress={()=>{
                          setModalContextData(value.item);
                          setModalVisible(!modalVisible);
                        }}
                        style={{
                          marginRight:20,
                          borderRadius:8,
                        }}>
                        <ImageBackground resizeMode='cover' source={image} 
                        style={{
                          width: height>width? 0.43*width: 0.44*height,
                          height: height>width ? 0.30*height: 0.27*width
                        }} imageStyle={{borderRadius:8,}} />
                      </Pressable>
                    );
                    }}
                    keyExtractor={(item, index: number) => 'extractor-'+item.id+'-'+index}
                />
            </>
          }
        </View>
    );
}

function PopularMoviesCarousel({style}: CarouselProps): React.JSX.Element{
  const {
    modalContextData, setModalContextData, setViewAll, viewAll, modalVisible, setModalVisible,
    modalTitle, setModalTitle, modalContextItems, setModalContexItems,
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;
  const {height, width} = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<Array<ICatergoryItem> | []>([]);

  async function doGet(){
    setLoading(true);
    try {
      const url = 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1';
      const result = await fetch(url, {
        headers:{
          'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYWViYWExMWM5ZTg1NmExMmI4ZWUyYTEyZTUxZWQxYyIsInN1YiI6IjY1Mjk1Yzc2NTQ0YzQxMGRkN2IxYWM3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fO0zhjg8J99-ga6CwwuSZpnYwTT1F6x6SiQIf8Gb_5E',
          'content-type': 'application/json'
        }
      });
      const temp = await result.json();
      setItems(temp?.results);
    } catch (error) {
        console.log({error});
        setError(true);
    }
    setLoading(false)
  }
  useEffect(()=>{
    doGet();
  },[]);

  return(
      <View style={{
        height: height>width ? 0.37*height: 0.35*width,
        paddingHorizontal:15,marginVertical:10,
      }}>
        {
            loading?
              <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'center',paddingBottom:15}}>
                <ActivityIndicator/>
              </View>
            : error?
              <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'space-between',paddingBottom:15}}>
                <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Error Occured</Text>
                <Pressable
                  onPress={()=>doGet()}
                >
                  <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>Retry</Text>
                </Pressable>
              </View>
            :
            <>
              <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'space-between',paddingBottom:15}}>
                  <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Popular Movies</Text>
                  <Pressable
                    onPress={()=>{
                      setModalTitle('Popular Movies');
                      setModalContexItems(items);
                      setViewAll(!viewAll);
                    }}
                  >
                    <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>View all</Text>
                  </Pressable>
              </View>
              <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  bounces={false}
                  data={items}
                  contentContainerStyle={{
                    height: height>width ? 0.30*height: 0.27*width
                  }}
                  initialNumToRender={5}
                  renderItem={value=>{
                    const image = {uri: `https://image.tmdb.org/t/p/original${value.item?.poster_path || '' }`};   
                  return(
                    <Pressable 
                      onPress={()=>{
                        setModalVisible(!modalVisible);
                        setModalContextData(value.item);
                      }}
                      style={{
                        backgroundColor:'grey',
                        marginRight:20,
                        borderRadius:8,
                        
                      }}>
                      <ImageBackground resizeMode='cover' source={image} style={{
                        width: height>width? 0.43*width: 0.44*height,
                        height: height>width ? 0.30*height: 0.27*width
                      }} imageStyle={{borderRadius:8,}} />
                    </Pressable>
                  );
                  }}
                  keyExtractor={(item, index: number) => 'extractor-'+item.id+'-'+index}
              />
            </>
        }
      </View>
  );
}

function TrendingTVShowsCarousel({style}: CarouselProps): React.JSX.Element{
  const {
    modalContextData, setModalContextData, setViewAll, viewAll, modalVisible, setModalVisible,
    modalTitle, setModalTitle, modalContextItems, setModalContexItems
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;
  const {height, width} = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<Array<ICatergoryItem> | []>([]);

  async function doGet(){
    setLoading(true);
    try {
      const url = 'https://api.themoviedb.org/3/trending/tv/day?language=en-US';
      const result = await fetch(url, {
        headers:{
          'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYWViYWExMWM5ZTg1NmExMmI4ZWUyYTEyZTUxZWQxYyIsInN1YiI6IjY1Mjk1Yzc2NTQ0YzQxMGRkN2IxYWM3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fO0zhjg8J99-ga6CwwuSZpnYwTT1F6x6SiQIf8Gb_5E',
          'content-type': 'application/json'
        }
      });
      const temp = await result.json();
      setItems(temp?.results);
    } catch (error) {
        console.log({error});
        setError(true);
    }
    setLoading(false)
  }
  useEffect(()=>{
    doGet();
  },[]);

  return(
      <View style={{
        height: height>width ? 0.37*height: 0.35*width,
        paddingHorizontal:15, marginVertical:10
      }}>
        {
          loading?
            <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'center',paddingBottom:15}}>
              <ActivityIndicator/>
            </View>
          : error?
            <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'space-between',paddingBottom:15}}>
              <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Error Occured</Text>
              <Pressable
                onPress={()=>doGet()}
              >
                <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>Retry</Text>
              </Pressable>
            </View>
          :
          <>
            <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'space-between',paddingBottom:15}}>
                <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Trending TV Shows</Text>
                <Pressable
                  onPress={()=>{
                    setModalTitle('Trending TV Shows');
                    setModalContexItems(items);
                    setViewAll(!viewAll);
                  }}
                >
                  <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>View all</Text>
                </Pressable>
            </View>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                data={items}
                contentContainerStyle={{
                  height: height>width ? 0.30*height: 0.27*width
                }}
                initialNumToRender={5}
                renderItem={value=>{
                  const image = {uri: `https://image.tmdb.org/t/p/original${value.item?.poster_path || '' }`};   
                return(
                  <Pressable 
                  onPress={()=>{
                    setModalVisible(!modalVisible);
                    setModalContextData(value.item);
                  }}
                    style={{
                      marginRight:20,
                      borderRadius:8,                
                    }}>
                    <ImageBackground resizeMode='cover' source={image} style={{
                      width: height>width? 0.43*width: 0.44*height,
                      height: height>width ? 0.30*height: 0.27*width
                    }} imageStyle={{borderRadius:8,}} />
                  </Pressable>
                );
                }}
                keyExtractor={(item, index: number) => 'extractor-'+item.id+'-'+index}
            />
          </>
        }
      </View>
  );
}

function DiscoverTVShowsCarousel({style}: CarouselProps): React.JSX.Element{
  const {
    modalContextData, setModalContextData, setViewAll, viewAll, modalVisible, setModalVisible,
    modalTitle, setModalTitle, modalContextItems, setModalContexItems
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;
  const {height, width} = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<Array<ICatergoryItem> | []>([]);

  async function doGet(){
    setLoading(true);
    try {
      const url = 'https://api.themoviedb.org/3/tv/popular?language=en-US&page=1';
      const result = await fetch(url, {
        headers:{
          'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYWViYWExMWM5ZTg1NmExMmI4ZWUyYTEyZTUxZWQxYyIsInN1YiI6IjY1Mjk1Yzc2NTQ0YzQxMGRkN2IxYWM3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fO0zhjg8J99-ga6CwwuSZpnYwTT1F6x6SiQIf8Gb_5E',
          'content-type': 'application/json'
        }
      });
      const temp = await result.json();
      setItems(temp?.results);
    } catch (error) {
        console.log({error});
        setError(true);
    }
    setLoading(false)
  }
  useEffect(()=>{
    doGet();
  },[]);

  return(
      <View
        style={{
          height: height>width ? 0.37*height: 0.35*width,
          paddingHorizontal:15, marginVertical:10,
        }}>
        {
          loading?
            <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'center',paddingBottom:15}}>
              <ActivityIndicator/>
            </View>
          : error?
            <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'space-between',paddingBottom:15}}>
              <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Error Occured</Text>
              <Pressable
                onPress={()=>doGet()}
              >
                <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>Retry</Text>
              </Pressable>
            </View>
          :
          <>
            <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'space-between',paddingBottom:15}}>
                <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Discover TV Shows</Text>
                <Pressable
                  onPress={()=>{
                    setModalTitle('Discover TV Shows');
                    setModalContexItems(items);
                    setViewAll(!viewAll);
                  }}
                >
                  <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>View all</Text>
                </Pressable>
            </View>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                data={items}
                contentContainerStyle={{
                  height: height>width ? 0.30*height: 0.27*width
                }}
                initialNumToRender={5}
                renderItem={value=>{
                  const image = {uri: `https://image.tmdb.org/t/p/original${value.item?.poster_path || '' }`};   
                return(
                  <Pressable
                    onPress={()=>{
                      setModalVisible(!modalVisible);
                      setModalContextData(value.item);
                    }}
                    style={{
                      backgroundColor:'grey',
                      marginRight:20,
                      borderRadius:8,                
                    }}
                  >
                    <ImageBackground resizeMode='cover' source={image} 
                      style={{
                        width: height>width? 0.43*width: 0.44*height,
                        height: height>width ? 0.30*height: 0.27*width
                      }} imageStyle={{borderRadius:8,}} />
                  </Pressable>
                );
                }}
                keyExtractor={(item, index: number) => 'extractor-'+item.id+'-'+index}
            />
          </>
        }
      </View>
  );
}

const CatergoryItemModal = () => {
  const {
    modalContextData, setModalContextData, setViewAll, viewAll, modalVisible, setModalVisible,
    modalTitle, setModalTitle, modalContextItems, setModalContexItems
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;
  const {height, width} = useWindowDimensions();

  const [favourite, setFavourites] = useState(false);
  const [watchNext, setWatchNext] = useState(false);

  useEffect(()=>{
      existsInFavouriteList(modalContextData!).then(result => setFavourites(result));
      existsInWatchNextList(modalContextData!).then(result => setWatchNext(result));
  }, []);
  
  const handlePress = useCallback(async () => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(`www.google.com`);
    console.log(supported)
    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(`www.google.com`);
    }
  }, []);
  const [loading, setLoading] = useState(true);

  return(
    <View style={{...styles.centeredView, }}>
      <Modal
        animationType="slide"
        transparent={true}
        statusBarTranslucent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
          <ImageBackground 
            onLoadEnd={()=>setLoading(false)}
            blurRadius={19}
            source={{uri:`https://image.tmdb.org/t/p/original${ modalContextData?.backdrop_path ||'' }`}}
          style={{backgroundColor:Colors.primaryBgColor+'df', height:1.1*height, width,}}>
            <View style={{...styles.centeredView,marginTop:0, }}>

            {loading?
              <ActivityIndicator/>
            : 
              <>
                <Image
                width={0.9*width}
                height={height>width?0.30*height:0}
                style={{marginHorizontal:15, borderTopLeftRadius:8, borderTopRightRadius:8}}
                source={{uri: `https://image.tmdb.org/t/p/original${modalContextData?.backdrop_path ||'' }`}}/>
                <View
                style={{
                  borderRadius: height>width? 0: 8,
                  borderBottomLeftRadius:8, borderBottomRightRadius:8,
                  backgroundColor:Colors.secondaryBgColor+'f9', 
                  width: 0.9*width,
                  paddingHorizontal:15,}}>
                  <Text style={{...styles.modalText, fontSize:20, fontWeight:'400', color:Colors.primaryTextColor, marginVertical:25}}>{
                    modalContextData?.name||modalContextData?.title||''
                  }</Text>
                  
                  <View style={{flexDirection:'row', columnGap:15, marginVertical:10}}>
                    <Pressable
                      onPress={()=>{
                        if ('name' in modalContextData || 'title' in modalContextData){
                          if (favourite) {
                            removeFromFavouriteList(modalContextData!);
                          } else {
                            addToFavouritesList(modalContextData!);
                          }
                          setFavourites(!favourite);
                        }
                      }}
                    >
                      <MaterialCommunityIcons name="heart-plus" size={35} color={favourite? 'grey' : Colors.activeButtonBgColor}/>
                    </Pressable>

                    <Pressable
                      onPress={()=>{
                        if ('name' in modalContextData || 'title' in modalContextData){
                          if (watchNext) {
                            removeFromToWatchNextList(modalContextData!);
                          } else {
                            addToWatchNextList(modalContextData!);
                          }
                          setWatchNext(!watchNext);
                        }
                      }}
                    >
                      <MaterialIcons name="add-to-queue" size={35} color={watchNext? 'grey' : Colors.activeButtonBgColor}/>
                    </Pressable>

                    <Pressable
                      onPress={async ()=>{ 
                        try {
                          const result = await Share.share({
                            message:
                            'overview' in modalContextData? 
                            "Hey, check out my latest pick for you. Search the title: \n\n"+(modalContextData?.name || modalContextData?.title || 'unavailable')+("\n\n"+modalContextData?.overview) : '',
                          });
                        } catch (error: any) {
                          console.log(error);
                        }
                      }}
                    >
                      <MaterialIcons name="share" size={35} color={Colors.activeButtonBgColor}/>
                    </Pressable>
                    
                  </View>
                  <ScrollView style={{maxHeight: 0.25*height}}>
                    <Text style={{fontSize:15, color:Colors.secondaryTextColor, marginVertical:10}}>
                      {modalContextData?.overview|| ''}</Text>
                  </ScrollView>

                  {/* TODO: Deep linking  */}
                  <Pressable
                    style={{backgroundColor:Colors.activeButtonBgColor, width:0.3*width, marginVertical:25, borderRadius:16,
                      height:height>width?0.05*height:0.085*height,
                      justifyContent:'center', alignSelf:'center'}}
                    onPress={handlePress}>
                    <Text style={styles.textStyle}>Play Trailer</Text>
                  </Pressable>
                </View>
              </>
            }
            </View>
          </ImageBackground>
      </Modal>
    </View>
  );
}

type ModalCarouselProps = {
  modalTitle: string;
  modalContextItems: Array<ICatergoryItem> | [];
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  setModalContextData: (value: ICatergoryItem) => void;
  paginationHandler?:(value:number)=>void;
};

const ModalCarousel = ({
  modalTitle, 
  modalContextItems,
  modalVisible, 
  setModalVisible,
  setModalContextData,
  paginationHandler
}: ModalCarouselProps) => {

  const {height, width} = useWindowDimensions();
  const [start, setStart] = useState<number>(0);
  const scrollRef = useRef<ScrollView>(null)

  return (
    <View style={{backgroundColor:Colors.primaryBgColor+'df',  height:1.1*height, width,}}>
      <View style={{...styles.centeredView, marginTop:0, }}>
        <View style={{
          borderRadius:8,
          backgroundColor:Colors.secondaryBgColor+'f9', width: 0.9*width, 
          height:0.85*height,
          paddingHorizontal:15,}}>                      
          <View style={{flexDirection:'row', columnGap:15, marginVertical:25}}>
            <Text style={{fontSize:20, color:Colors.primaryTextColor}}>{modalTitle}</Text>
          </View>
        
          <ScrollView
            ref={scrollRef}
            scrollEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{flexWrap:'wrap', flexDirection:'row',
            justifyContent:'center',
          }}>
            {modalContextItems?.slice(start, start+10)?.map((value:ICatergoryItem, index:number)=>{
              const [load, setLoad] = useState(true);
              
              const image = {uri: `https://image.tmdb.org/t/p/original${value.poster_path || '' }`};   
              return(
                <Pressable
                key={index+value.id}
                onPress={()=>{
                  setModalVisible(!modalVisible);
                  setModalContextData(value);
                }}
                  style={{
                    marginBottom:20,
                    marginRight:15,
                    borderRadius:8,                
                  }}>
                  <ImageBackground
                  onLoadStart={() =>setLoad(true)}
                  onLoadEnd={()=>setLoad(false)}
                  resizeMode='cover' source={image} style={{
                    width: height>width? 0.35*width : 0.20*width,
                    height: height>width? 0.25*height : 0.35*width}} imageStyle={{borderRadius:8,}}>
                      {load?<ActivityIndicator/>:null}
                    </ImageBackground>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={{flexDirection:'row', justifyContent:'center', columnGap:25}}>
            <Pressable
              style={{backgroundColor:Colors.activeButtonBgColor, width:0.3*width, marginVertical:25, borderRadius:16,
                height: height>width? 0.05*height: 0.05*width,
                justifyContent:'center', alignSelf:'center'}}
              onPress={() => {
                setStart(start-10 < 0? 0: start-10);
              }}>
              <Text style={styles.textStyle}>Previous</Text>
            </Pressable>
            <Pressable
              style={{backgroundColor:Colors.activeButtonBgColor, width:0.3*width, marginVertical:25, borderRadius:16,
                height: height>width? 0.05*height: 0.05*width,
                justifyContent:'center', alignSelf:'center'}}
              onPress={() => {
                scrollRef.current?.scrollTo({
                  y: 0,
                  animated: true,
                });
                setStart(start+10 > modalContextItems?.length - 10? start: start+10);
              }}>
              <Text style={styles.textStyle}>Next</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const CatergoryItemsModal = () => {
  const {
    modalContextData, setModalContextData, setViewAll, viewAll, modalVisible, setModalVisible,
    modalTitle, setModalTitle, modalContextItems, setModalContexItems,
    genre,
    setGenre,
    genreUrl,
    setGenreUrl,
    genreModalVisibility,
    setGenreModalVisibility
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;
  const {height, width} = useWindowDimensions();

  return(
    <View style={{...styles.centeredView, height,}}>
      <Modal
        animationType="slide"
        transparent={true}
        statusBarTranslucent
        visible={viewAll}
        onRequestClose={() => {
          setViewAll(!viewAll);
        }}>
          <ModalCarousel modalTitle={modalTitle} modalContextItems={modalContextItems} modalVisible setModalVisible={setModalVisible} setModalContextData={setModalContextData} />
      </Modal>
    </View>
  );
}

const GenreItemsModal = () => {
  const {
    modalContextData, setModalContextData, setViewAll, viewAll, modalVisible, setModalVisible,
    modalTitle, setModalTitle, modalContextItems, setModalContexItems,

    genre,
    setGenre,
    genreUrl,
    setGenreUrl,
    genreModalVisibility,
    setGenreModalVisibility
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;
  const {height, width} = useWindowDimensions();

  const [items, setItems] = useState<Array<ICatergoryItem> | []>([]);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  function paginationHandler(page=2){
    fetch(genreUrl.replace('page=1', 'page='+page), {
      headers:{
        'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYWViYWExMWM5ZTg1NmExMmI4ZWUyYTEyZTUxZWQxYyIsInN1YiI6IjY1Mjk1Yzc2NTQ0YzQxMGRkN2IxYWM3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fO0zhjg8J99-ga6CwwuSZpnYwTT1F6x6SiQIf8Gb_5E',
        'content-type': 'application/json'
      }
    })
    .then(result=>result.json())
    .then(data=>{setItems([...items,data.result])})
    .catch(error=>console.log({error}));
  }

  useEffect(()=>{
    async function doGet(){
      setLoading(true);
      try {
        const result = await fetch(genreUrl, {
          headers:{
            'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYWViYWExMWM5ZTg1NmExMmI4ZWUyYTEyZTUxZWQxYyIsInN1YiI6IjY1Mjk1Yzc2NTQ0YzQxMGRkN2IxYWM3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fO0zhjg8J99-ga6CwwuSZpnYwTT1F6x6SiQIf8Gb_5E',
            'content-type': 'application/json'
          }
        });
        const temp = await result.json();
        setItems(temp?.results);
      } catch (error) {
          console.log({error});
          setError(true);
      }
      setLoading(false)
    }
    if (genreUrl.length) doGet();
  },[genreUrl])


  return(
    <View style={{...styles.centeredView, height,}}>
      <Modal
        animationType="slide"
        transparent={true}
        statusBarTranslucent
        visible={genreModalVisibility}
        onRequestClose={() => {
          setGenreModalVisibility(!genreModalVisibility);
        }}>
        {loading || error?
           
            <View style={{backgroundColor:Colors.primaryBgColor+'df',  height:1.1*height, width,}}>
              <View style={{...styles.centeredView, marginTop:0, }}>
                <View style={{
                  borderRadius:8,
                  backgroundColor:Colors.secondaryBgColor+'f9', width: 0.9*width, 
                  justifyContent:'center',
                  alignContent:'center',
                  height:0.85*height,
                  paddingHorizontal:15,}}>
                  {loading?
                    <ActivityIndicator size="large" color="#00ff00" />
                    : error? <Text style={{fontSize:20, color:Colors.primaryTextColor, alignSelf:'center'}}>Error</Text>
                    : <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Found nothing for selection</Text>
                  }
                    
                  </View>
              </View>
            </View>
            :
            <ModalCarousel modalTitle={genre+' Top 20'} modalContextItems={items} 
            modalVisible={modalVisible} setModalVisible={setModalVisible} setModalContextData={setModalContextData}/>
        }
          
      </Modal>
    </View>
  );
}

type TOCCatergoryModal = {
  genreTitle:string;
  url: string;
};

// https://api.themoviedb.org/3/genre/movie/list
// https://api.themoviedb.org/3/genre/tv/list
// 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=action'


const HOCCatergoryModal = ({genreTitle, url}: TOCCatergoryModal) => {
  const {
    modalContextData, setModalContextData, setViewAll, viewAll, modalVisible, setModalVisible,
    modalTitle, setModalTitle, modalContextItems, setModalContexItems
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;
  const {height, width} = useWindowDimensions();
  // const []

  useEffect(()=>{
    fetch('');
  },[]);

  return(
    <View style={{...styles.centeredView, height,}}>
      <Modal
        animationType="slide"
        transparent={true}
        statusBarTranslucent
        visible={viewAll}
        onRequestClose={() => {
          setViewAll(!viewAll);
        }}>
          <ModalCarousel modalTitle={genreTitle} modalContextItems={modalContextItems} modalVisible setModalVisible={setModalVisible} setModalContextData={setModalContextData} />
      </Modal>
    </View>
  );
}


function Home({route, navigation}: HomeProps): React.JSX.Element {  
  const {height, width} = useWindowDimensions();

  const [contentSwitch, setContentSwitch] = useState<boolean>(true);

  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContextItems, setModalContexItems] = useState<Array<ICatergoryItem> | []>([]);
  const [viewAll, setViewAll] = useState<boolean>(false);

  const [modalContextData, setModalContextData] = useState<ICatergoryItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [genreModalVisibility, setGenreModalVisibility] = useState<boolean>(false);
  const [genreUrl, setGenreUrl] = useState<string>('');
  const [genre, setGenre] = useState<string>('');

  return (
      <CatergoryItemModalContext.Provider
      value={{
        modalContextData,
        setModalContextData,
        setViewAll,
        viewAll,
        
        modalVisible,
        setModalVisible,
        modalTitle,
        setModalTitle, 
        modalContextItems, 
        setModalContexItems,

        genre,
        setGenre,
        genreUrl,
        setGenreUrl,
        genreModalVisibility,
        setGenreModalVisibility
      }}
      >
        <SafeAreaView style={{backgroundColor:Colors.primaryBgColor,}}>
          <ContentHeader style={{height: height> width ? 0.12*height: 0.12*width}} state={contentSwitch} handleState={setContentSwitch}/>
          <ScrollView style={{height: height> width ? height-(0.22*height ) : width-(0.75*width ), }}>
            {contentSwitch?
              <>
                <BannerCarousel movies/>
                <GenreCarousel catergory={'movie'}/>
                <TrendingMoviesCarousel />
                <PopularMoviesCarousel />
              </>
              :
              <>
                <BannerCarousel tv/>
                <GenreCarousel catergory={'tv'}/>
                <TrendingTVShowsCarousel />
                <DiscoverTVShowsCarousel/>
              </>
            }
          </ScrollView>
          <GenreItemsModal />
          <CatergoryItemsModal />
          <CatergoryItemModal />
        </SafeAreaView>
      </CatergoryItemModalContext.Provider>
  );
}

const FloatingContentSwitcher = () => {
  const {height, width} = useWindowDimensions();
  const [contentSwitch, setContentSwitch] = useState(false);
  return (
    <Pressable 
      onPress={()=>{
        setContentSwitch(!contentSwitch)
      }}
      style={{position:'absolute', zIndex:1, bottom:0.1*height, alignSelf:'flex-end', right:0.05*width }}
    >
      <MaterialIcons name="switch-access-shortcut" color={Colors.primaryTextColor} size={40} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default Home;