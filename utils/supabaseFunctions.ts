import { supabase } from "./supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";
import { UserData } from "../components/UserInfo";
import { Movie } from '../utils/types';

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
        country: data.country,
        avatar_url: data.avatar_url,
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

export const updateAvatar = async (userId: string, file: File): Promise<string | null> => {
  const uniqueFileName = `${new Date().toISOString()}-${file.name}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(`${userId}/${uniqueFileName}`, file);

  if (error) {
    console.error("Error uploading avatar:", error.message);
    return null;
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("avatars")
    .createSignedUrl(`${userId}/${uniqueFileName}`, 604800);

  if (signedUrlError || !signedUrlData) {
    console.error("Error getting signed URL:", signedUrlError?.message);
    return null;
  }

  const signedUrl = signedUrlData.signedUrl;

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: signedUrl })
    .eq("id", userId);

  if (updateError) {
    console.error("Error updating avatar URL in users table:", updateError.message);
    return null;
  }

  return signedUrl;
};

export const updateUserInfo = async (id: string, nickname: string, birthdate: string, country: string, avatar_url: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ nickname: nickname, birthdate: birthdate, country: country, avatar_url: avatar_url })
            .eq('id', id);

        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error while updating user info:', (error as PostgrestError).message);
    }
};

export const likeMovie = async (movie: Movie, userId: string) => {
  try {
    const exists = await checkMovieExistence(movie.id);
    if (!exists) {
      await addMovieToDB(movie);
    }
    
    const { data, error } = await supabase
      .from('likes')
      .insert([{ user_id: userId, movie_id: movie.id }]);
  
    if (error) {
      console.error('Error liking movie', error);
    }
  
    return data;
  } catch (error) {
    console.error('Error in likeMovie function', error);
  }
};

export const unlikeMovie = async (movie: Movie, userId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .delete()
    .match({ user_id: userId, movie_id: movie.id });

  if (error) {
    console.error('Error unliking movie', error);
  }

  return data;
};

export const fetchLikedMovieIds = async (userId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .select('movie_id')
    .match({ user_id: userId });

  if (error) {
    console.error('Error fetching liked movies', error);
    return [];
  }

  return data.map(record => record.movie_id);
};

export const addMovieToDB = async (movie: Movie) => {
  const { data, error } = await supabase
    .from('movies')
    .insert([
      { 
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview,
        release_date: movie.release_date
      }
    ]);

  if (error) {
    console.error('Error adding movie to DB', error);
  }
};

export const checkMovieExistence = async (movieId: number) => {
  const { data, error } = await supabase
    .from('movies')
    .select('id')
    .eq('id', movieId);

  if (error) {
    console.error('Error checking movie existence', error);
    return false;
  }

  return data.length > 0;
};

export const fetchLikedMovies = async (userId: string): Promise<Movie[]> => {
  const movieIds = await fetchLikedMovieIds(userId);

  const movies = await Promise.all(movieIds.map(async (movieId) => {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', movieId)
      .single();

    if (error) {
      console.error('Error fetching movie:', error.message);
      return null;
    }
    return data as Movie;
  }));

  return movies.filter(movie => movie !== null) as Movie[];
};