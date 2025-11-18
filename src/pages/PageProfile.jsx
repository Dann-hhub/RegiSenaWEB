import PageProfile from '../components/user/myProfile/Profile';
import Layout from '../components/Layout';
import AnimatedPage from '../components/AnimatedPage';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CrudPage() {
  return (
    <>
      <Layout>
      <AnimatedPage>
      <div className="crud-container">
      <PageProfile/>
      </div>
      </AnimatedPage>
      </Layout>
    </>
  );
}