export interface Album {
  id: number;
  title: string;
  songs: number;
  releasedAt: string;
}

export interface CreateAlbumProps extends Omit<Album, "id"> {}
