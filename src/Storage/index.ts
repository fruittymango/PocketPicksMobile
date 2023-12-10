import EncryptedStorage from 'react-native-encrypted-storage';
import { ICatergoryItem } from '../Models';


export async function clearStorage() {
    try {
        await EncryptedStorage.clear();
    } catch (error) {
    }
}


export async function storeWatchNextList(newList: Array<ICatergoryItem> | []) {
    try {
        await EncryptedStorage.setItem(
            "watch_next",
            JSON.stringify(newList)
        );
    } catch (error) {
        console.log(error);
    }
}

export async function existsInWatchNextList(newItem: ICatergoryItem) {
    try {
        const result = await EncryptedStorage.getItem("watch_next");
        if (result) {
            let temp =  JSON.parse(result);
            for(let index=0; index<temp.length; index++){
                if (temp[index].backdrop_path === newItem.backdrop_path &&
                (temp[index]?.name === newItem?.name || temp[index]?.title === newItem?.title)) {
                   return true; 
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}


export async function addToWatchNextList(newItem: ICatergoryItem) {
    try {
        const result = await EncryptedStorage.getItem("watch_next");
    
        if (result) {
            let temp =  JSON.parse(result);
            for(let index=0; index<temp.length; index++){
                if (temp[index].backdrop_path === newItem.backdrop_path &&
                    temp[index].id === newItem.id &&
                    (temp[index]?.name === newItem?.name || temp[index]?.title === newItem?.title)
                ) {
                   return; 
                }
            }
            temp = [newItem, ...temp];
            await EncryptedStorage.setItem(
                "watch_next",
                JSON.stringify(temp)
            );
        } else {
            await EncryptedStorage.setItem(
                "watch_next",
                JSON.stringify([newItem])
            );
        }
    } catch (error) {
        console.log(error);
    }
}

export async function removeFromToWatchNextList(newItem: ICatergoryItem) {
    try {
        const result = await EncryptedStorage.getItem("watch_next");
    
        if (result) {
            let temp =  JSON.parse(result);
            let filtered = temp.filter((entryValue:ICatergoryItem)=>entryValue.name !== newItem?.name || entryValue.title !== newItem?.title);
            await EncryptedStorage.setItem(
                "watch_next",
                JSON.stringify(filtered)
            );
        }
    } catch (error) {
        console.log(error);
    }
}

export async function retrieveWatchNextList(): Promise<ICatergoryItem[] | []> {
    try {   
        const result = await EncryptedStorage.getItem("watch_next");
    
        if (result) {
            return JSON.parse(result);
        }

    } catch (error) {
        console.log(error);
    }
    return [];
}

export async function removeWatchNextList() {
    try {
        await EncryptedStorage.removeItem("watch_next");
    } catch (error) {
        console.log(error);
    }
}



export async function storeFavouritesList(newList: Array<ICatergoryItem> | []) {
    try {
        await EncryptedStorage.setItem(
            "favourites",
            JSON.stringify(newList)
        );

    } catch (error) {
        console.log(error);
    }
}

export async function existsInFavouriteList(newItem: ICatergoryItem) {
    try {
        const result = await EncryptedStorage.getItem("favourites");
        if (result) {
            let temp =  JSON.parse(result);
            for(let index=0; index<temp.length; index++){
                if (temp[index].backdrop_path === newItem.backdrop_path &&
                    temp[index].id === newItem.id &&
                    (temp[index]?.name === newItem?.name || temp[index]?.title === newItem?.title)
                ) {
                   return true; 
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

export async function addToFavouritesList(newItem: ICatergoryItem) {
    try {
        const result = await EncryptedStorage.getItem("favourites");
        if (result) {
            let temp =  JSON.parse(result);
            for(let index=0; index<temp.length; index++){
                if (temp[index].backdrop_path === newItem.backdrop_path &&
                    temp[index].id === newItem.id &&
                    (temp[index]?.name === newItem?.name || temp[index]?.title === newItem?.title)
                ) {
                   return; 
                }
            }
            temp = [newItem, ...temp]
            await EncryptedStorage.setItem(
                "favourites",
                JSON.stringify(temp)
            );
        } else{
            await EncryptedStorage.setItem(
                "favourites",
                JSON.stringify([newItem])
            );
        }
    } catch (error) {
        console.log(error);
    }
}

export async function removeFromFavouriteList(newItem: ICatergoryItem) {
    try {
        const result = await EncryptedStorage.getItem("favourites");
    
        if (result) {
            let temp =  JSON.parse(result);
            let filtered = temp.filter((entryValue:ICatergoryItem)=>entryValue.name !== newItem?.name || entryValue.title !== newItem?.title);
            await EncryptedStorage.setItem(
                "favourites",
                JSON.stringify(filtered)
            );
        }
    } catch (error) {
        console.log(error);
    }
}

export async function retrieveFavouritesList(): Promise<ICatergoryItem[] | []> {
    try {   
        const result = await EncryptedStorage.getItem("favourites");
    
        if (result) {
            return JSON.parse(result);
        }

    } catch (error) {
        console.log(error);
    }
    return [];
}

export async function removeFavouritesList() {
    try {
        await EncryptedStorage.removeItem("favourites");
    } catch (error) {
        console.log(error);
    }
}