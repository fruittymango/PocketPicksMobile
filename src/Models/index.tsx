import { createContext } from 'react';
import {ViewStyle} from 'react-native';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export const Colors = {
    primaryTextColor: '#F3F3F4',
    secondaryTextColor: '#979797',
    actionableTxtColor: '#E82251',
    activeButtonBgColor: '#D72C55',
    primaryBgColor: '#0A1823',
    secondaryBgColor: '#222E3E',
};

export type CarouselProps = {
    style?: ViewStyle;
    CategoryItems?: Array<ICatergoryItem>;
};

export type BannerCarouselProps = {
  style?: ViewStyle;
  tv?:boolean;
  movies?:boolean;
};

export type ModalCarouselProps = {
    modalTitle: string;
    modalContextItems: Array<ICatergoryItem> | [];
    modalVisible: boolean;
    setModalVisible: (value: boolean) => void;
    setModalContextData: (value: ICatergoryItem) => void;
    paginationHandler?:(value:number)=>void;
  };
  
export  type GenreCarouselProps = {
    style?: ViewStyle;
    catergory: string;
};

export type CatergoryItemModalContextType = {

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

export type TActiveTitle = {
    title: string;
    active?: boolean;
  };
  
export type DropDownProps = {
    list: Array<TActiveTitle>;
    setList: (newList:Array<TActiveTitle>)=>void;
    style?: ViewStyle;
};
   
export const Tab = createBottomTabNavigator<RootStackParamList>();

export type RootStackParamList = {
    Home: { userId: string } | undefined;
    MyList: { userId: string } | undefined;
    Profile: { userId: string } | undefined;
    Notifications: { userId: string } | undefined;
};
export  type HomeProps = BottomTabScreenProps<RootStackParamList, 'Home'>;
export  type ProfileProps = BottomTabScreenProps<RootStackParamList, 'Profile'>;
export  type NotificationsProps = BottomTabScreenProps<RootStackParamList, 'Notifications'>
export  type MyListProps = BottomTabScreenProps<RootStackParamList, 'MyList'>

export interface IGenre{
    id: number;
    name: string;
}

export type ICatergoryItem = {
    name?: string;
    title?: string;
    video: boolean;
    adult: boolean;
    backdrop_path: string;
    first_air_date?: string;
    genre_ids: Array<number>;
    id: number;
    original_language?: string;
    origin_country?: Array<string>;
    original_title?: string;
    original_name?: string;
    overview?: string;
    popularity?: number;
    poster_path?: string;
    release_date: string;
    vote_average?: number;
    vote_count?: number;
    media_type?: string;
};

export interface ICache{
    favourites: Array<ICatergoryItem> | undefined;
    toWatchNext: Array<ICatergoryItem> | undefined;
}

export type ContentHeaderProps = {
    style?: ViewStyle;
    state: boolean;
    handleState: (value: boolean)=>void; 
};