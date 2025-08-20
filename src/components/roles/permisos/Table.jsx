import React from 'react';

const TablaPermisos = () => {
  // Lista de permisos
  const permisos = [
    { id: 1, nombre: 'Gestionar roles', descripcion: 'Permite crear, editar y eliminar roles' },
    { id: 2, nombre: 'Gestionar usuarios', descripcion: 'Permite administrar cuentas de usuario' },
    { id: 3, nombre: 'Gestionar personas', descripcion: 'Permite administrar registros de personas' },
    { id: 4, nombre: 'Gestionar tipo persona', descripcion: 'Permite administrar categorías de personas' },
    { id: 5, nombre: 'Gestionar equipos', descripcion: 'Permite administrar equipos y dispositivos' },
    { id: 6, nombre: 'Gestionar tipo equipo', descripcion: 'Permite administrar categorías de equipos' },
    { id: 7, nombre: 'Gestionar movimientos', descripcion: 'Permite administrar movimientos de equipos' }
  ];

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-success">Listado de Permisos</h2>
      <div className="table-responsive">
        <table className="table table-bordered border-success table-hover">
          <thead className="bg-success text-white">
            <tr>
              <th scope="col" className="text-center">Nombre del Permiso</th>
              <th scope="col" className="text-center">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {permisos.map((permiso) => (
              <tr key={permiso.id}>
                <td className="align-middle">{permiso.nombre}</td>
                <td className="align-middle">{permiso.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Estilos adicionales */}
      <style jsx>{`
        .table {
          border-color: #28a745 !important;
        }
        .table-hover tbody tr:hover {
          background-color: rgba(40, 167, 69, 0.1);
        }
        th {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default TablaPermisos;