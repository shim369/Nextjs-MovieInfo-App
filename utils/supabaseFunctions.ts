import { supabase } from "./supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";
import { UserData } from "../components/UserInfo";

export const getUserInfo = async (userId: string): Promise<UserData | null> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
  
    if (error) {
      console.error("Error fetching user info:", error.message);
      return null;
    }
  
    if (data) {
        return {
          nickname: data.nickname,
          birthdate: data.birthdate,
          country: data.country
        } as UserData;
    }
  
    return null;
};
  


export const addUserInfo = async (id: string, nickname: string, birthdate: string, country: string, avatar_url: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .insert({ id: id, nickname: nickname, birthdate: birthdate, country: country, avatar_url: avatar_url });

        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error while adding user info:', (error as PostgrestError).message);
    }
};
