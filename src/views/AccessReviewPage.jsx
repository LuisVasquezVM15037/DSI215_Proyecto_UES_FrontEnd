//PBI REVISAR ACCESOS- Lógica en frontend para Pantalla para revisar los intentos de acceso al sistema 
import { useEffect, useState } from 'react';
import { getRegistrosAcceso } from '../services/usuario.service';

const AccessReviewPage = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  ///Se agregan 3 estados para filtar los registros de acceso, se agregan para el PBI revisar accesos 
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    const cargarRegistros = async () => {
      try {
        setLoading(true);
        const data = await getRegistrosAcceso();
        setRegistros(data);
      } catch (err) {
        console.error('Error al cargar registros de acceso:', err);
        setError('No se pudieron cargar los registros de acceso.');
      } finally {
        setLoading(false);
      }
    };

    cargarRegistros();
  }, []);

  //Creo una funcion para formatear la fecha en formato legible 
  const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';

  const fechaLimpia = fecha.split('.')[0];
  const date = new Date(fechaLimpia);

  return date.toLocaleString('es-SV', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Cargando registros de acceso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Revisar accesos</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }
    // Lógica para filtrar los registros de acceso, se agrega para el PBI revisar accesos 
    const registrosFiltrados = registros.filter((registro) => {
  const usuario = String(registro.email_usuario || '').toLowerCase();
  const filtro = filtroUsuario.toLowerCase();

  const fechaRegistro = new Date(registro.fecha_acceso);
  const inicio = fechaInicio ? new Date(`${fechaInicio}T00:00:00`) : null;
  const fin = fechaFin ? new Date(`${fechaFin}T23:59:59`) : null;

  const coincideUsuario = usuario.includes(filtro);
  const coincideFechaInicio = !inicio || fechaRegistro >= inicio;
  const coincideFechaFin = !fin || fechaRegistro <= fin;

  return coincideUsuario && coincideFechaInicio && coincideFechaFin;
});   

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Revisar accesos</h1>
      <p className="text-slate-500 mb-6">
        Consulta de intentos de acceso registrados en el sistema.
      </p>
         
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 mb-5">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        Filtrar por usuario
      </label>
      <input
        type="text"
        value={filtroUsuario}
        onChange={(e) => setFiltroUsuario(e.target.value)}
        placeholder="Correo del usuario"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        Fecha inicio
      </label>
      <input
        type="date"
        value={fechaInicio}
        onChange={(e) => setFechaInicio(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        Fecha fin
      </label>
      <input
        type="date"
        value={fechaFin}
        onChange={(e) => setFechaFin(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>

    <div className="flex items-end">
      <button
        type="button"
        onClick={() => {
          setFiltroUsuario('');
          setFechaInicio('');
          setFechaFin('');
        }}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        Limpiar filtros
        </button>
       </div>
     </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Correo electrónico del Usuario</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Fecha de acceso</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Resultado</th>
            </tr>
          </thead>

          <tbody>
            {registrosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-slate-500">
                  No hay registros de acceso que coincidan con los filtros para mostrar.
                </td>
              </tr>
            ) : (
            registrosFiltrados.map((registro) => (
                <tr
                  key={registro.id_registro_acceso}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-700">
                    {registro.id_registro_acceso}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                   {registro.email_usuario}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {formatearFecha(registro.fecha_acceso)}
                  </td>

                  <td className="px-4 py-3">
                   {registro.es_exitoso ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                        Exitoso
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                        Fallido
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessReviewPage;