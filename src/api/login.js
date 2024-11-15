import request from '@/utils/request'

const userApi = {
  Login: '/auth/login',
  Login2: '/auth/login2',
  Logout: '/auth/logout',
  ForgePassword: '/auth/forge-password',
  Register: '/auth/register',
  twoStepCode: '/auth/2step-code',
  SendSms: '/account/sms',
  SendSmsErr: '/account/sms_err',
  // get my info
  UserInfo: '/user/info',
  UserInfo2: '/user/info2',
  UserInfo3: '/user/info3',
  UserMenu: '/user/nav'
}

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login (parameter) {
  console.log('login', parameter)
  let url = ''
  if (parameter.username === 'user') {
    url = userApi.Login2
  } else {
    url = userApi.Login
  }
  return request({
    url: url,
    method: 'post',
    data: parameter
  })
}
export function getSmsCaptcha (parameter) {
  return request({
    url: userApi.SendSms,
    method: 'post',
    data: parameter
  })
}

export function getInfo (parameter) {
  let url = ''
  if (parameter === 'user') {
    url = userApi.UserInfo2
  } else {
    url = userApi.UserInfo
  }
  return request({
    url: url,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
export function getCurrentUserNav () {
  return request({
    url: userApi.UserMenu,
    method: 'get'
  })
}
export function logout () {
  return request({
    url: userApi.Logout,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * get user 2step code open?
 * @param parameter {*}
 */
export function get2step (parameter) {
  return request({
    url: userApi.twoStepCode,
    method: 'post',
    data: parameter
  })
}
