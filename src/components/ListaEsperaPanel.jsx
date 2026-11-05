import React, { useState, useEffect } from 'react';
import {
  getListaEspera,
  descartarListaEspera,
  eliminarListaEspera,
} from '../services/listaEspera.service';
import ModalListaEspera from './ModalListaEspera';
import Swal from 'sweetalert2';

/**
 * Panel de Gestión de Lista de Espera de Pacientes.
 * DENTALCARE-92 (PBI-Secret-14)
 */
export default function ListaEsperaPanel({ pacientes = [], odontologos = [], onAgendarPaciente }) {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('EN_ESPERA');
  const [modalOpen, setModalOpen] = useState(false);

  const cargarLista = async () => {
    setLoading(true);
    try {
      const res = await getListaEspera(filtroEstado === 'TODOS' ? null : filtroEstado);
      if (Array.isArray(res)) {
        setLista(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLista();
  }, [filtroEstado]);

  const handleDescartar = async (id, nombre) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Descartar de lista?',
      text: `¿Deseas marcar a ${nombre} como descartado de la lista de espera?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, descartar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (isConfirmed) {
      try {
        await descartarListaEspera(id);
        cargarLista();
        Swal.fire({
          icon: 'success',
          title: 'Descartado',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const handleEliminar = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Se eliminará permanentemente de la lista de espera.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (isConfirmed) {
      try {
        await eliminarListaEspera(id);
        cargarLista();
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const getPrioridadBadge = (prioridad) => {
    switch (prioridad) {
      case 'ALTA':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIA':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'BAJA':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'EN_ESPERA':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'NOTIFICADO':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'AGENDADO':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DESCARTADO':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Estado:</span>
          <div className="flex items-center gap-1">
            {[
              { id: 'EN_ESPERA', label: 'En Espera' },
              { id: 'NOTIFICADO', label: 'Notificados' },
              { id: 'AGENDADO', label: 'Agendados' },
              { id: 'TODOS', label: 'Todos' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFiltroEstado(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filtroEstado === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <i className="bi bi-person-plus-fill" /> Añadir a Lista de Espera
        </button>
      </div>

      {/* Tabla de Pacientes en Espera */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <i className="bi bi-arrow-repeat animate-spin text-2xl block mb-2 text-blue-600" />
            Cargando lista de espera...
          </div>
        ) : lista.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <i className="bi bi-inbox text-3xl block mb-2 text-slate-300" />
            No hay pacientes registrados con estado "{filtroEstado}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3 px-4">Horario / Días Preferidos</th>
                  <th className="py-3 px-4">Motivo Consulta</th>
                  <th className="py-3 px-4">Doctor Asignado</th>
                  <th className="py-3 px-4 text-center">Prioridad</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lista.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{item.nombrePaciente}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.telefonoPaciente ? `Tel: ${item.telefonoPaciente}` : 'Sin teléfono'}{' '}
                        {item.numeroIdentidadPaciente && `• DUI: ${item.numeroIdentidadPaciente}`}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">{item.rangoHorarioPreferido}</div>
                      <div className="text-[11px] text-slate-400">{item.diasPreferidos || 'Cualquier día'}</div>
                    </td>

                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="truncate font-medium text-slate-800" title={item.motivoConsulta}>
                        {item.motivoConsulta}
                      </div>
                      {item.notas && (
                        <div className="truncate text-[10px] text-slate-400 italic" title={item.notas}>
                          Nota: {item.notas}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">
                        {item.nombreOdontologo || <em className="text-slate-400">Cualquiera disponible</em>}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getPrioridadBadge(
                          item.prioridad
                        )}`}
                      >
                        {item.prioridad}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getEstadoBadge(
                          item.estado
                        )}`}
                      >
                        {item.estado.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.estado !== 'AGENDADO' && (
                          <button
                            type="button"
                            onClick={() => onAgendarPaciente && onAgendarPaciente(item)}
                            title="Agendar cita formal con este paciente"
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <i className="bi bi-calendar-plus" /> Agendar
                          </button>
                        )}

                        {item.estado === 'EN_ESPERA' && (
                          <button
                            type="button"
                            onClick={() => handleDescartar(item.id, item.nombrePaciente)}
                            title="Descartar de lista de espera"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <i className="bi bi-slash-circle" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEliminar(item.id)}
                          title="Eliminar registro"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para añadir a lista de espera */}
      <ModalListaEspera
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pacientes={pacientes}
        odontologos={odontologos}
        onSuccess={cargarLista}
      />
    </div>
  );
}
