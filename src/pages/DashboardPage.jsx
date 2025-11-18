import PageDashboard from '../components/dashboard/dashboard';
import Layout from '../components/Layout';
import AnimatedPage from '../components/AnimatedPage';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CrudPage() {
  return (
    <>
      <Layout>
        <AnimatedPage>
          <PageDashboard/>
        </AnimatedPage>
      </Layout>
    </>
  );
}