import PagePermisos from '../components/roles/permisos/Table';
import Layout from '../components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CrudPage() {
  return (
    <>
      <Layout>
      <div className="crud-container">
      <PagePermisos/>
      </div>
      </Layout>
    </>
  );
}