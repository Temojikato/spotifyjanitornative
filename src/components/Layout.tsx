import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './Header';
import LinearGradient from 'react-native-linear-gradient';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000', 'rgba(30,215,96,1)', '#000']}
        locations={[0, 0.6, 0.8]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 2, y: 2 }}
        style={StyleSheet.absoluteFill}
      />
      <Header />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent', // so the gradient shows through
    margin: 8,
    padding: 8,
    borderRadius: 8
  }
});

export default Layout;
