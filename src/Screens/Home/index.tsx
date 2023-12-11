/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import { ICatergoryItem, CatergoryItemModalContext} from '../../Models';

import {
  Colors,
  BannerCarousel,
  GenreCarousel,
  TrendingMoviesCarousel,
  PopularMoviesCarousel,
  TrendingTVShowsCarousel,
  DiscoverTVShowsCarousel,
  CatergoryItemModal,
  ContentHeader,
  CatergoryItemsModal,
  GenreItemsModal,
 } from '../../Components';

function Home(): React.JSX.Element {  
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


export default Home;