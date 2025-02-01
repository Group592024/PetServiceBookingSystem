import { create } from 'zustand'
import { getData } from '../Utilities/ApiFunctions';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading:true,
  fetchUserInfo: async (uid)=>{
    if(!uid) return set({currentUser:null, isLoading:false});
    try{
      console.log("chay trong use store");
        const data = await  getData(`api/Account/${uid}`);
        if(data.flag){
            set({currentUser: data.data, isLoading:false})
            console.log("chay trong use store", data);
           
        } else{
            set({currentUser: null, isLoading:false})
        }
    }
    catch{
        set({currentUser:null, isLoading:false});
    }
  }
}))
