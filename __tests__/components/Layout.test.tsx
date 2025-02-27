import { render, screen } from '@testing-library/react';
import Layout from '../../components/Layout';

jest.mock('../../components/Header', () => () => (
  <div data-testid="header" style={{ height: '50px' }}>Header</div>
));

describe('Layout', () => {
  test('renders header and children', () => {
    render(
      <Layout>
        <div data-testid="child">Child Content</div>
      </Layout>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
