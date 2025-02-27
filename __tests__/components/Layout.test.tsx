import React from 'react';
import { render } from '@testing-library/react-native';
import Layout from '../../src/components/Layout';
import { Text } from 'react-native';

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  return (props: any) => <>{props.children}</>;
});

jest.mock('../../src/components/Header', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text>Header Component</Text>;
});

describe('Layout', () => {
  it('renders header, children and gradient background', () => {
    const { getByText } = render(
      <Layout>
        <Text>Test Child</Text>
      </Layout>
    );
    expect(getByText('Header Component')).toBeTruthy();
    expect(getByText('Test Child')).toBeTruthy();
  });
});
