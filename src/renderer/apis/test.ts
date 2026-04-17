import request from '@/renderer/utils/request'

export const register = (data = {}) => {
  return request({
    url: '/v1/user/register',
    method: 'post',
    data
  })
}

export const login = (data = {}) => {
  return request({
    url: '/v1/user/login',
    method: 'post',
    data
  })
}
export const getAllUsers = (data = {}) => {
  return request({
    url: '/v1/user/getAllUsersPage',
    method: 'post',
    data
  })
}

export const editUsersInfoById = (data = {}) => {
  return request({
    url: '/v1/user/editUsersInfoById',
    method: 'post',
    data
  })
}

export const deleteUserById = (data = {}) => {
  return request({
    url: '/v1/user/deleteUserById',
    method: 'post',
    data
  })
}
export const uploadWallpaper = (data = {}) => {
  return request({
    url: '/v1/wallpaper/uploadWallpaper',
    method: 'post',
    data
  })
}
export const getWallpaperPage = (data = {}) => {
  return request({
    url: '/v1/wallpaper/getWallpaperPage',
    method: 'post',
    data
  })
}