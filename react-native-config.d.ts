declare module 'react-native-config' {
    export interface NativeConfig {
        HOSTNAME?: string;
        API_KEY?:string;
    }
    
    export const Config: NativeConfig
    export default Config
}