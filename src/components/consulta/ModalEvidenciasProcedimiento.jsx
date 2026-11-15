import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import {
  listarEvidenciasPorPlan,
  subirEvidenciaProcedimiento,
  eliminarEvidencia,
  resolverUrlArchivo,
} from '../../services/archivo.service';
import { alertSuccess, alertError, confirmDialog } from '../../utils/alert.utils';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Modal de Evidencias Clínicas Fotográficas / Radiográficas por Procedimiento (Punto 7).
 * Permite al odontólogo subir fotos de antes/después, radiografías intraorales y comentarios clínicos.
 */
const ModalEvidenciasProcedimiento = ({ isOpen, onClose, procedimiento }) => {
  const [evidencias, setEvidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [previewLocal, setPreviewLocal] = useState(null);
  const [comentario, setComentario] = useState('');
  const [fotoEnGrande, setFotoEnGrande] = useState(null);

  const idPlan = procedimiento?.idPlanTratamiento;

  const cargarEvidencias = async () => {
    if (!idPlan) return;
    setLoading(true);
    try {
      const data = await listarEvidenciasPorPlan(idPlan);
      setEvidencias(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && idPlan) {
      cargarEvidencias();
      setArchivoSeleccionado(null);
      setPreviewLocal(null);
      setComentario('');
      setFotoEnGrande(null);
    }
  }, [isOpen, idPlan]);

  const handleSeleccionarArchivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoSeleccionado(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewLocal(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubirEvidencia = async (e) => {
    e.preventDefault();
    if (!archivoSeleccionado) {
      alertError('Debes seleccionar una imagen para subir.');
      return;
    }

    setSubiendo(true);
    try {
      await subirEvidenciaProcedimiento(idPlan, archivoSeleccionado, comentario);
      alertSuccess('Evidencia guardada', 'La imagen clínica se adjuntó exitosamente.');
      setArchivoSeleccionado(null);
      setPreviewLocal(null);
      setComentario('');
      await cargarEvidencias();
    } catch (err) {
      alertError(err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminar = async (idEvidencia) => {
    const ok = await confirmDialog(
      '¿Eliminar evidencia?',
      'Esta imagen clínica será eliminada del expediente.',
      'Sí, eliminar'
    );
    if (!ok) return;

    try {
      await eliminarEvidencia(idEvidencia);
      alertSuccess('Evidencia eliminada', 'La imagen fue retirada del procedimiento.');
      setEvidencias(prev => prev.filter(e => e.idEvidencia !== idEvidencia));
    } catch (err) {
      alertError(err.message);
    }
  };

  if (!isOpen || !procedimiento) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">

        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
              <i className="bi bi-camera-fill" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Evidencias Clínicas del Procedimiento
              </h3>
              <p className="text-xs text-slate-500">
                {procedimiento.piezaDental
                  ? `Pieza Dental #${procedimiento.piezaDental}`
                  : 'Procedimiento General'} · {procedimiento.nombreTratamiento}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <i className="bi bi-x-lg text-sm" />
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Formulario de subida de nueva evidencia */}
          <form onSubmit={handleSubirEvidencia} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <i className="bi bi-cloud-arrow-up-fill text-primary-600" /> Adjuntar nueva evidencia
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              {/* Selector de archivo / Preview */}
              <div>
                <label className="cursor-pointer block border-2 border-dashed border-slate-300 hover:border-primary-400 rounded-xl p-3 text-center bg-white transition-colors">
                  {previewLocal ? (
                    <div className="relative group">
                      <img
                        src={previewLocal}
                        alt="Previsualización"
                        className="w-full h-28 object-cover rounded-lg"
                      />
                      <span className="absolute inset-0 bg-black/40 text-white text-xs font-medium flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Cambiar foto
                      </span>
                    </div>
                  ) : (
                    <div className="py-4">
                      <i className="bi bi-image text-3xl text-slate-400" />
                      <p className="text-xs font-semibold text-slate-600 mt-1">Seleccionar o soltar imagen</p>
                      <p className="text-[10px] text-slate-400">JPG, PNG o WEBP</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleSeleccionarArchivo}
                  />
                </label>
              </div>

              {/* Comentario y botón de subida */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Descripción clínica o hallazgo (opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ej. Radiografía periapical pre-operatoria mostrando lesión cariosa profunda..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  fullWidth
                  loading={subiendo}
                  disabled={!archivoSeleccionado}
                  icon={<i className="bi bi-upload" />}
                >
                  Subir Evidencia
                </Button>
              </div>
            </div>
          </form>

          {/* Galería de evidencias ya adjuntas */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Evidencias Registradas ({evidencias.length})</span>
              {loading && <span className="text-[11px] font-normal text-slate-400">Cargando...</span>}
            </h4>

            {evidencias.length === 0 && !loading && (
              <div className="text-center py-8 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <i className="bi bi-images text-3xl text-slate-300" />
                <p className="text-xs font-medium text-slate-600 mt-2">No hay evidencias adjuntas</p>
                <p className="text-[11px] text-slate-400">Sube fotos o radiografías clínicas para tener respaldo gráfico del tratamiento.</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {evidencias.map((ev) => {
                const imgUrl = resolverUrlArchivo(ev.urlFoto);
                const fecha = ev.fechaSubida
                  ? new Date(ev.fechaSubida).toLocaleString('es-SV', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : '';

                return (
                  <div
                    key={ev.idEvidencia}
                    className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div
                      className="cursor-pointer relative overflow-hidden bg-slate-100 aspect-video flex items-center justify-center"
                      onClick={() => setFotoEnGrande({ url: imgUrl, comentario: ev.comentario, fecha })}
                    >
                      <img
                        src={imgUrl}
                        alt={ev.nombreArchivo || 'Evidencia'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white p-1 rounded-md text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="bi bi-arrows-fullscreen" />
                      </span>
                    </div>

                    <div className="p-2 flex-1 flex flex-col justify-between">
                      <div>
                        {ev.comentario ? (
                          <p className="text-[11px] text-slate-700 line-clamp-2 leading-snug font-medium">
                            {ev.comentario}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">Sin comentarios</p>
                        )}
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{fecha}</span>
                        <button
                          type="button"
                          onClick={() => handleEliminar(ev.idEvidencia)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                          title="Eliminar evidencia"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>

      {/* Lightbox / Visor de Imagen en Tamaño Completo */}
      {fotoEnGrande && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFotoEnGrande(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={fotoEnGrande.url}
              alt="Evidencia en grande"
              className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
            {fotoEnGrande.comentario && (
              <div className="mt-3 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-xl text-center max-w-xl">
                {fotoEnGrande.comentario}
              </div>
            )}
            <button
              onClick={() => setFotoEnGrande(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 text-xl"
            >
              <i className="bi bi-x-circle-fill" /> Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalEvidenciasProcedimiento;
