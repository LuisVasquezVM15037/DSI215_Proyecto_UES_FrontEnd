// PBI REVISAR ACCESOS - Lógica en frontend para Pantalla para revisar los intentos de acceso al sistema 
import { useEffect, useState, useMemo } from 'react';
import { getRegistrosAcceso } from '../services/usuario.service';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const AccessReviewPage = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const cargarRegistros = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRegistrosAcceso();
      setRegistros(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar registros de acceso:', err);
      setError('No se pudieron cargar los registros de acceso. Por favor verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getRegistrosAcceso()
      .then(data => {
        if (active) setRegistros(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error al cargar registros de acceso:', err);
        if (active) setError('No se pudieron cargar los registros de acceso. Por favor verifica la conexión con el servidor.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Formato de fecha legible
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const fechaLimpia = fecha.split('.')[0];
    const date = new Date(fechaLimpia);
    if (isNaN(date.getTime())) return fecha;

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

  // Filtrar registros
  const registrosFiltrados = useMemo(() => {
    return registros.filter((registro) => {
      const usuario = String(registro.email_usuario || '').toLowerCase();
      const filtro = filtroUsuario.toLowerCase().trim();

      const fechaRegistro = new Date(registro.fecha_acceso);
      const inicio = fechaInicio ? new Date(`${fechaInicio}T00:00:00`) : null;
      const fin = fechaFin ? new Date(`${fechaFin}T23:59:59`) : null;

      const coincideUsuario = !filtro || usuario.includes(filtro);
      const coincideFechaInicio = !inicio || fechaRegistro >= inicio;
      const coincideFechaFin = !fin || fechaRegistro <= fin;

      return coincideUsuario && coincideFechaInicio && coincideFechaFin;
    });
  }, [registros, filtroUsuario, fechaInicio, fechaFin]);

  // Métricas rápidas
  const metricas = useMemo(() => {
    const total = registros.length;
    const exitosos = registros.filter((r) => r.es_exitoso).length;
    const fallidos = total - exitosos;
    return { total, exitosos, fallidos };
  }, [registros]);

  const hayFiltrosActivos = Boolean(filtroUsuario || fechaInicio || fechaFin);

  const limpiarFiltros = () => {
    setFiltroUsuario('');
    setFechaInicio('');
    setFechaFin('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Cargando bitácora de accesos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="bg-red-50/80 border border-red-200/80 rounded-2xl p-6 text-center max-w-lg mx-auto shadow-card">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 text-xl">
            <i className="bi bi-shield-x" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Error de Carga</h2>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <Button variant="primary" onClick={cargarRegistros} icon="bi-arrow-clockwise">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-600 inline-block"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">Seguridad & Auditoría</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Revisión de Accesos
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registro cronológico y auditoría de intentos de inicio de sesión en la plataforma.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={cargarRegistros}
          icon="bi-arrow-clockwise"
        >
          Actualizar
        </Button>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="bi bi-fingerprint" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Intentos</p>
            <p className="text-2xl font-bold font-heading text-slate-800">{metricas.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="bi bi-check-circle" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Accesos Exitosos</p>
            <p className="text-2xl font-bold font-heading text-emerald-700">{metricas.exitosos}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="bi bi-x-circle" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Intentos Fallidos</p>
            <p className="text-2xl font-bold font-heading text-rose-700">{metricas.fallidos}</p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-5">
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <i className="bi bi-funnel text-primary-600" />
            <span>Filtros de Búsqueda</span>
          </div>
          {hayFiltrosActivos && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 font-medium">
              Filtros activos ({registrosFiltrados.length} encontrados)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            label="Usuario o Correo"
            type="text"
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            placeholder="ej. doctor@dentalcare.com"
            icon="bi-search"
          />

          <Input
            label="Fecha Inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            icon="bi-calendar-event"
          />

          <Input
            label="Fecha Fin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            icon="bi-calendar-event"
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant={hayFiltrosActivos ? 'secondary' : 'ghost'}
              onClick={limpiarFiltros}
              disabled={!hayFiltrosActivos}
              icon="bi-arrow-counterclockwise"
              className="w-full"
            >
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de Auditoría */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="py-3.5 px-5">ID</th>
                <th scope="col" className="py-3.5 px-5">Usuario / Correo</th>
                <th scope="col" className="py-3.5 px-5">Fecha y Hora</th>
                <th scope="col" className="py-3.5 px-5 text-center">Estado de Acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl mb-3">
                        <i className="bi bi-shield-slash" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">
                        No se encontraron registros
                      </p>
                      <p className="text-xs text-slate-400 text-center mb-4">
                        {hayFiltrosActivos
                          ? 'No hay intentos que coincidan con los criterios de búsqueda especificados.'
                          : 'Aún no se han registrado eventos de acceso en la plataforma.'}
                      </p>
                      {hayFiltrosActivos && (
                        <Button variant="secondary" size="sm" onClick={limpiarFiltros} icon="bi-arrow-counterclockwise">
                          Restablecer Filtros
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((registro) => {
                  const esExitoso = Boolean(registro.es_exitoso);
                  return (
                    <tr
                      key={registro.id_registro_acceso}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-5 text-slate-400 font-mono text-xs font-medium">
                        #{registro.id_registro_acceso}
                      </td>

                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            esExitoso ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            <i className={esExitoso ? 'bi bi-person' : 'bi bi-person-x'} />
                          </div>
                          <span className="truncate max-w-xs">{registro.email_usuario}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-slate-600 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <i className="bi bi-clock text-slate-400" />
                          <span>{formatearFecha(registro.fecha_acceso)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        {esExitoso ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Exitoso
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Fallido
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        {registrosFiltrados.length > 0 && (
          <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>Mostrando {registrosFiltrados.length} de {registros.length} intentos</span>
            <span className="flex items-center gap-1 text-slate-400">
              <i className="bi bi-shield-check text-emerald-600" /> Auditoría activa
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessReviewPage;