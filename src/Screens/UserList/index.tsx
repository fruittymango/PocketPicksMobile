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
import { useFocusEffect } from '@react-navigation/native';

import { mockdata } from '../../Models/MockData';
import { ICatergoryItem, IGenre } from '../../Models';
import { addToFavouritesList, addToWatchNextList, existsInFavouriteList, existsInWatchNextList, removeFavouritesList, removeFromFavouriteList, removeFromToWatchNextList, removeWatchNextList, retrieveFavouritesList, retrieveWatchNextList} from '../../Storage';

type CatergoryItemModalContextType = {

  modalContextData: ICatergoryItem | {};
  setModalContextData: (value:ICatergoryItem) => void ;
  modalVisible: boolean;
  setModalVisible: (value:boolean)=>void;

  deleteModalVisible: boolean;
  setDeleteModalVisible: (value:boolean) => void;

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

type MyListProps = BottomTabScreenProps<RootStackParamList, 'MyList'>

type TActiveTitle = {
  title: string;
  active?: boolean;
};

type ContentHeaderProps = {
  style?: ViewStyle;
  state: boolean;
  handleState: (value: boolean)=>void; 
};

const ContentHeader = ({style, state, handleState}:ContentHeaderProps)=> {
  return(
    <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', paddingVertical:25, paddingHorizontal: 15, marginBottom:15, ...style,}}>
      <View>
        <Text style={{fontSize:25, color:Colors.primaryTextColor, fontWeight:'600'}}>POCKET</Text>
        <Text style={{fontSize:22, color:Colors.primaryTextColor, fontWeight:'400', letterSpacing:9}}>`ICKS</Text>
      </View>
      
      <View style={{display:'flex', flexDirection:'row', columnGap:15, width: '25%', justifyContent:'flex-end', alignSelf:'center' }}>
        <Pressable
          onPress={()=>handleState(!state)}
        >
        <MaterialCommunityIcons name="delete" color={Colors.primaryTextColor} size={25} />
        </Pressable>
      </View>
    </View>
  );
}

type FavouriteItemsProps = {
  style?: ViewStyle;
};

const FavouriteItems = ({style}:FavouriteItemsProps)=> {
  const {height, width} = useWindowDimensions();

  const {
    setModalContextData, setViewAll, viewAll, modalVisible, setModalVisible,
    setModalTitle, setModalContexItems, 
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;
  const [favouriteItems, setFavouriteItems] = useState<Array<ICatergoryItem> | []>([])

  useEffect(()=>{
    retrieveFavouritesList().then(result=>setFavouriteItems(result))
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = retrieveFavouritesList().then(result=>setFavouriteItems(result))
    }, [])
  );

  return(
    <View style={{
      height: height>width ? 0.37*height: 0.35*width, paddingHorizontal:15, marginVertical:10}}>
      <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'space-between',paddingBottom:15}}>
          <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Favourites</Text>
          <Pressable
            onPress={()=>{
              if (favouriteItems.length) {
                setModalTitle('Your Favourite Picks');
                setModalContexItems(favouriteItems);
                setViewAll(!viewAll);
              }
            }}
          >
            <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>View all</Text>
          </Pressable>
      </View>
      {favouriteItems.length?
        <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            data={favouriteItems}
            contentContainerStyle={{
              height: height>width ? 0.30*height: 0.27*width
            }}
            initialNumToRender={5}
            renderItem={value=>{
              const image = {uri: `https://image.tmdb.org/t/p/original${value.item.poster_path || '' }`};   
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
                <ImageBackground
                resizeMode='cover'
                source={image}
                style={{
                  width: height>width? 0.43*width: 0.44*height,
                  height: height>width ? 0.30*height: 0.27*width
                  }} imageStyle={{borderRadius:8,}} />
              </Pressable>
            );
            }}
            keyExtractor={(item) => 'extractor-'+item.id}
        />
      :
        <Text style={{fontSize:16, color:Colors.primaryTextColor}}>You are yet to spot your favourite picks.</Text>
      }
    </View>
  );
}

type WatchListProps = {
  style?: ViewStyle;
};

const WatchList = ({style}:WatchListProps)=> {
  const {height, width} = useWindowDimensions();

  const {
    setModalContextData, setViewAll, viewAll, modalVisible, setModalVisible,
    setModalTitle, setModalContexItems
  } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;
  const [watchNextItems, setWatchNextItems] = useState<Array<ICatergoryItem> | []>([])

  useEffect(()=>{
    retrieveWatchNextList().then(result=>setWatchNextItems(result))
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = retrieveWatchNextList().then(result=>setWatchNextItems(result))
    }, [])
  );

  return(
    <View style={{height: height>width ? 0.37*height: 0.35*width, paddingHorizontal:15, marginVertical:10}}>
      <View style={{display:'flex', flexDirection:'row', alignItems:'center',     justifyContent:'space-between',paddingBottom:15}}>
          <Text style={{fontSize:20, color:Colors.primaryTextColor}}>Watch Next</Text>
          <Pressable
            onPress={()=>{
              if (watchNextItems.length) {
                setModalTitle('Watch Next');
                setModalContexItems(watchNextItems);
                setViewAll(!viewAll);
              }
            }}
          >
            <Text style={{fontSize:15, color:Colors.actionableTxtColor}}>View all</Text>
          </Pressable>
      </View>
      {
        watchNextItems.length?
          <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              data={watchNextItems}
              contentContainerStyle={{height: height>width ? 0.30*height: 0.27*width}}
              initialNumToRender={5}
              renderItem={value=>{
                const image = {uri: `https://image.tmdb.org/t/p/original${value.item.poster_path || '' }`};   
              return(
                <Pressable
                  onPress={()=>{
                    setModalContextData(value.item);
                    setModalVisible(!modalVisible);
                  }}
                  style={{
                    backgroundColor:'grey',
                    marginRight:20,
                    borderRadius:8,
                  }}>
                  <ImageBackground 
                    resizeMode='cover'
                    source={image} 
                    style={{
                      width: height>width? 0.43*width: 0.44*height,
                      height: height>width ? 0.30*height: 0.27*width
                    }} imageStyle={{borderRadius:8,}} />
                </Pressable>
              );
              }}
              keyExtractor={(item) => 'extractor-'+item.id}
          />
        :
        <Text style={{fontSize:16, color:Colors.primaryTextColor}}>You have not selected anything to watch next.</Text>
      }
    </View>
  );
}

type RecommendationsCarouselProps = {
  style?: ViewStyle;
};

function RecommendationsCarousel({style}: RecommendationsCarouselProps): React.JSX.Element {
  const {height, width} = useWindowDimensions();

  return(
      <FlatList
      horizontal
      initialNumToRender={5}
      showsHorizontalScrollIndicator={false}
      bounces={false}
      data={[1, 2, 3, 4, 5]}
      scrollToOverflowEnabled
      contentContainerStyle={{height:0.20*height, alignItems:'center', paddingHorizontal:15,marginVertical:5, ...style}}
      contentOffset = {{x: 0.87*width, y: 0}}
      renderItem={value=>{
          const image = {uri: `https://image.tmdb.org/t/p/original${value || '' }`};   
          return(
          <Pressable 
            style={{marginRight: 15,backgroundColor:'grey',}}
            onPress={()=>null}
          >
            <ImageBackground resizeMode='cover' source={image} style={{width:0.86*width,
              height:0.20*height,}} imageStyle={{borderRadius:16,}} />
              
          </Pressable>
          );
      }}
      keyExtractor={item => ''+item}/>
  );
}

const CatergoryItemModal = () => {

  const {
    modalContextData,  modalVisible, setModalVisible,
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
                        if ('name' in modalContextData  || 'title' in modalContextData){
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
                  setModalContextData(value);
                  setModalVisible(true);
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
    setModalContextData, setViewAll, viewAll, setModalVisible,
    modalTitle, modalContextItems,
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


function MyList({route, navigation}: MyListProps): React.JSX.Element {
  const {height, width} = useWindowDimensions();

  const [cacheManagementModalVisible, setCacheManagementModalVisible] = useState<boolean>(true);
  const [deleteModalState, setDeleteModalState] = useState<boolean>(true);

  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContextItems, setModalContexItems] = useState<Array<ICatergoryItem> | []>([]);
  const [viewAll, setViewAll] = useState<boolean>(false);

  const [modalContextData, setModalContextData] = useState<ICatergoryItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [deleteModalVisible, setDeleteModalVisible,] = useState<boolean>(false);

  const CacheManageModal = () => {
    const {height, width} = useWindowDimensions();

    const {
      deleteModalVisible,
      setDeleteModalVisible,
    } = useContext(CatergoryItemModalContext)  as CatergoryItemModalContextType;

    const [watchNextItems, setWatchNextItems] = useState<Array<ICatergoryItem> | []>([])
    const [favouriteItems, setFavouriteItems] = useState<Array<ICatergoryItem> | []>([])
    const [done, setDone] = useState<boolean>(false);

    useEffect(()=>{
      retrieveWatchNextList().then(result=>setWatchNextItems(result))
      retrieveFavouritesList().then(result=>setFavouriteItems(result))
    }, []);

    const DeleteItem = () => {

      const [selected, setSelected] = useState<boolean>(false);
      const [empty, setEmpty] = useState<boolean>(false);

      return (
        <Pressable>
          <Text style={{fontSize: 20, color:Colors.primaryTextColor,}}></Text>
          <MaterialCommunityIcons name="delete" color={Colors.primaryTextColor} size={20} />
        </Pressable>
      );
    };
    

    return(
      <View style={{height:height>width?0.05*height:0.085*height, }}>
        <Modal
          animationType="slide"
          transparent={true}
          statusBarTranslucent
          visible={deleteModalVisible}
          onRequestClose={() => {
            setDeleteModalVisible(!deleteModalVisible);
          }}>
            <View style={{backgroundColor:Colors.primaryBgColor+'df', height:height>width?1.1*height:height, }}>
              <View style={{...styles.centeredView,marginTop:0, }}>
                
                <View style={{
                  borderRadius:8,
                  backgroundColor:Colors.secondaryBgColor+'f9', width: width>height?0.5*width:0.8*width, paddingHorizontal:15,}}>
                  <Text style={{...styles.modalText, fontSize:20, fontWeight:'400', color:Colors.primaryTextColor, marginVertical:25}}>Manage Your Picks</Text>

                  {done?
                  <>
                    <Text style={{fontSize: 15, color:Colors.primaryTextColor,}}>
                      Deletion succeeds.
                    </Text>
                    <Pressable
                      style={{backgroundColor:Colors.activeButtonBgColor, width:0.3*width, marginVertical:25, borderRadius:16,height:height>width?0.05*height:0.085*height, justifyContent:'center', alignSelf:'center'}}
                      onPress={() => {
                        setDeleteModalVisible(false);
                      }}>
                      <Text style={styles.textStyle}>Okay</Text>
                    </Pressable>
                  </>
                  :
                  <>
                    <Pressable
                      style={{
                        flexDirection:'row', display:'flex', justifyContent:'space-between',alignItems:'center', marginVertical:10
                      }}
                      onPress={async () => {
                        if (watchNextItems.length) {
                          await removeWatchNextList();
                          setDone(!done);
                        }
                      }}
                    >
                      <Text style={{fontSize: 15, color:Colors.primaryTextColor,}}>Watch List</Text>
                      <MaterialCommunityIcons name={watchNextItems.length? "delete":"delete-empty"} color={Colors.primaryTextColor} size={20} />
                    </Pressable>
                    <Pressable
                      style={{
                        flexDirection:'row', display:'flex', justifyContent:'space-between', alignItems:'center', marginVertical:10
                      }}
                      onPress={async () => {
                        if (favouriteItems.length) {
                          await removeFavouritesList();
                          setDone(!done);
                        }
                      }}
                    >
                      <Text style={{fontSize: 15, color:Colors.primaryTextColor,}}>Favourites</Text>
                      <MaterialCommunityIcons name={favouriteItems.length? "delete":"delete-empty"} color={Colors.primaryTextColor} size={20} />
                    </Pressable>
                    <Pressable
                      style={{backgroundColor:Colors.activeButtonBgColor, width:0.3*width, marginVertical:25, borderRadius:16,height:height>width?0.05*height:0.085*height, justifyContent:'center', alignSelf:'center'}}
                      onPress={async () => {
                        await removeFavouritesList();
                        await removeWatchNextList();
                        setDone(!done);
                      }}>
                      <Text style={styles.textStyle}>Clear All</Text>
                    </Pressable>
                  </>
                  }
                  
                </View>
              </View>
            </View>
        </Modal>
      </View>
    );
  }


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

        deleteModalVisible,
        setDeleteModalVisible,
      }}
      >
      <SafeAreaView style={{backgroundColor:Colors.primaryBgColor}}>
        <ContentHeader style={{height: height> width ? 0.12*height: 0.12*width}} state={deleteModalVisible} handleState={setDeleteModalVisible}/>
        <ScrollView style={{height: height> width ? height-(0.22*height ) : width-(0.75*width ), }}>
          <WatchList/>
          <FavouriteItems />
        </ScrollView>
        <CacheManageModal />
        <CatergoryItemsModal />
        <CatergoryItemModal />
      </SafeAreaView>
      </CatergoryItemModalContext.Provider>
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

export default MyList;