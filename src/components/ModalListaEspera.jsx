import React, { useState } from 'react';
import { agregarListaEspera } from '../services/listaEspera.service';
import Swal from 'sweetalert2';

/**
 * Modal para registrar un nuevo paciente en la Lista de Espera.
 * DENTALCARE-92 (PBI-Secret-14)
 */
export default function ModalListaEspera({ isOpen, onClose, pacientes = [], odontologos = [], onSuccess }) {
  const [pacienteId, setPacienteId] = useState('');
  const [odontologoId, setOdontologoId] = useState('');
  const [rangoHorarioPreferido, setRangoHorarioPreferido] = useState('Mañana (08:00 - 12:00)');
  const [diasPreferidos, setDiasPreferidos] = useState('Lunes a Viernes');
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [prioridad, setPrioridad] = useState('MEDIA');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pacienteId) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor selecciona un paciente.',
      });
      return;
    }

    if (!motivoConsulta.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor indica el motivo de la consulta.',
      });
      return;
    }

    setGuardando(true);
    try {
      await agregarListaEspera({
        pacienteId: Number(pacienteId),
        odontologoId: odontologoId ? Number(odontologoId) : null,
        rangoHorarioPreferido,
        diasPreferidos,
        motivoConsulta,
        prioridad,
        notas,
      });

      Swal.fire({
        icon: 'success',
        title: 'Paciente registrado',
        text: 'El paciente fue agregado exitosamente a la lista de espera.',
        timer: 2000,
        showConfirmButton: false,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo registrar en la lista de espera.',
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate__animated animate__fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate__animated animate__zoomIn animate__faster">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
              <i className="bi bi-person-lines-fill" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                Añadir a Lista de Espera
              </h3>
              <p className="text-[11px] text-slate-400">
                Registro de paciente para asignación ante cupos liberados
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="bi bi-x-lg text-sm" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selector de Paciente */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Paciente <span className="text-red-500">*</span>
            </label>
            <select
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Seleccionar Paciente --</option>
              {pacientes.map((p) => (
                <option key={p.idPaciente} value={p.idPaciente}>
                  {p.nombrePaciente} {p.apellidoPaciente} (DUI: {p.numeroIdentidadPaciente || 'S/D'})
                </option>
              ))}
            </select>
          </div>

          {/* Odontólogo preferido */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Odontólogo de Preferencia <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <select
              value={odontologoId}
              onChange={(e) => setOdontologoId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Cualquier odontólogo disponible</option>
              {odontologos.map((doc) => {
                const nombreDoc = doc.usuario
                  ? `${doc.usuario.nombreUsuario} ${doc.usuario.apellidoUsuario}`
                  : `Doctor #${doc.idOdontologo}`;
                return (
                  <option key={doc.idOdontologo} value={doc.idOdontologo}>
                    {nombreDoc} ({doc.especialidadOdontologo})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Fila: Horario preferido & Prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Franja Horaria Preferida
              </label>
              <select
                value={rangoHorarioPreferido}
                onChange={(e) => setRangoHorarioPreferido(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Mañana (08:00 - 12:00)">Mañana (08:00 - 12:00)</option>
                <option value="Mediodía (11:00 - 14:00)">Mediodía (11:00 - 14:00)</option>
                <option value="Tarde (14:00 - 17:00)">Tarde (14:00 - 17:00)</option>
                <option value="Indistinto">Cualquier horario libre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nivel de Prioridad
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
              >
                <option value="ALTA" className="text-red-600 font-bold">ALTA (Dolor / Urgencia)</option>
                <option value="MEDIA" className="text-amber-600 font-bold">MEDIA (Regular)</option>
                <option value="BAJA" className="text-slate-600">BAJA (Control / Rutina)</option>
              </select>
            </div>
          </div>

          {/* Días preferidos */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Días de Preferencia
            </label>
            <input
              type="text"
              value={diasPreferidos}
              onChange={(e) => setDiasPreferidos(e.target.value)}
              placeholder="Ej: Lunes, Miércoles o Viernes"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Motivo de consulta */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Motivo o Procedimiento Solicitado <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)}
              required
              placeholder="Ej: Valoración de cordales, limpieza profunda o dolor en molar"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              rows="2"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones de contacto o disponibilidad..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {guardando ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle" /> Agregar a Lista de Espera
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
