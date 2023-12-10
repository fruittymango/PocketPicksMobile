import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export const Colors = {
    primaryTextColor: '#F3F3F4',
    secondaryTextColor: '#979797',
    actionableTxtColor: '#E82251',
    activeButtonBgColor: '#D72C55',
    primaryBgColor: '#0A1823',
    secondaryBgColor: '#222E3E',
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