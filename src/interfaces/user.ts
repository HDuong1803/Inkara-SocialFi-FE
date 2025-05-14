export interface IUserSimple {
  id: string
  fullname: string
  username: string
  address: string
  photo: {
    url: string
  }
}

export interface IUserProfile {
  id: string
  fullname: string
  username: string
  email: string
  role: string
  address: string
  bio?: string
  createdAt: string
  updatedAt: string
  photo: {
    url: string
  }
  _count: {
    followers: number
    followings: number
    posts: number
    ownedNFTs: number
  }
  websiteUrl?: string
}
