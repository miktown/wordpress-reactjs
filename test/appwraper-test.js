'use strict'

import test from 'ava'
import React from 'react'
import { shallow, mount } from 'enzyme'
import 'jsdom-global/register'

import AppWrapper from '../app/containers/app'

test('shallow unit component <AppWrapper />', t => {
  let mock = {}
  mock.name = 'moo'

  const wrapper = shallow(<AppWrapper />)
  const wrapperMoo = shallow(<AppWrapper name={mock.name} />)

  t.is(wrapper.contains(<p>Hello <strong>World</strong></p>), true)
  t.is(wrapperMoo.contains(<p>Hello <strong>{mock.name}</strong></p>), true)
})

test('mount <AppWrapper />', t => {
  const wrapper = mount(<AppWrapper />)
  const fooInner = wrapper.find('p')
  t.is(fooInner.length, 1, 'Tiene un único strong')
})

test('<AppWrapper /> -> setNameFromProps set name hello + name', t => {
  let appWrapper = new AppWrapper()
  let result = {}
  let mock = {}

  mock.text = 'mooo'
  mock.number = 123
  mock.voidString = ''

  result.paramText = appWrapper.setNameFromProps(mock.text)
  result.paramVoid = appWrapper.setNameFromProps()
  result.paramNumber = appWrapper.setNameFromProps(mock.number)
  result.paramVoidString = appWrapper.setNameFromProps(mock.voidString)

  t.is(typeof appWrapper.setNameFromProps, 'function', 'setNameFromProps is function')
  t.is(result.paramText, mock.text, 'Param shold return param')
  t.is(result.paramVoid, 'World', 'Default void param shold return World')
  t.is(result.paramNumber, 'World', 'Not String returns World')
  t.is(result.paramVoidString, 'World', 'void string returns World')
})
