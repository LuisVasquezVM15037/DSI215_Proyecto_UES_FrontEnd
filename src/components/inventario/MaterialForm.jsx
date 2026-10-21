import React, { useState } from 'react';
import Button from '../ui/Button';

export const MaterialForm = ({ onRegistrar, onRedirectToList }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    unidadMedida: 'Jeringa 4g',
    stockActual: 0,
    stockMinimo: 5,
    descripcion: '',
  });

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  // Validaciones según AC de DENTALCARE-26
  const esCodigoValido = (cod) => /^MT\d+$/i.test(cod?.trim() || '');
  const esNombreValido = (nom) => {
    const len = nom?.trim().length || 0;
    return len >= 5 && len <= 100;
  };
  const esUnidadValida = (u) => (u?.trim().length || 0) > 0;
  const esStockValido = (stk) => Number(stk) >= 0;

  const errores = {
    codigo: touched.codigo && !esCodigoValido(formData.codigo)
      ? 'El código debe comenzar con MT seguido de dígitos (ej: MT78)'
      : null,
    nombre: touched.nombre && !esNombreValido(formData.nombre)
      ? 'El nombre debe tener entre 5 y 100 caracteres'
      : null,
    unidadMedida: touched.unidadMedida && !esUnidadValida(formData.unidadMedida)
      ? 'La unidad de medida es obligatoria'
      : null,
    stockActual: touched.stockActual && !esStockValido(formData.stockActual)
      ? 'El stock no puede ser negativo'
      : null,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      codigo: true,
      nombre: true,
      unidadMedida: true,
      stockActual: true,
      stockMinimo: true,
    });

    if (
      !esCodigoValido(formData.codigo) ||
      !esNombreValido(formData.nombre) ||
      !esUnidadValida(formData.unidadMedida) ||
      !esStockValido(formData.stockActual)
    ) {
      return;
    }

    setSubmitting(true);
    const res = await onRegistrar({
      ...formData,
      codigo: formData.codigo.trim().toUpperCase(),
      nombre: formData.nombre.trim(),
      unidadMedida: formData.unidadMedida.trim(),
      stockActual: parseInt(formData.stockActual, 10) || 0,
      stockMinimo: parseInt(formData.stockMinimo, 10) || 5,
    });
    setSubmitting(false);

    if (res?.success) {
      setLastCreated(res.data);
      setShowSuccessCard(true);
    }
  };

  const handleReset = () => {
    setFormData({
      codigo: '',
      nombre: '',
      unidadMedida: 'Jeringa 4g',
      stockActual: 0,
      stockMinimo: 5,
      descripcion: '',
    });
    setTouched({});
    setShowSuccessCard(false);
    setLastCreated(null);
  };

  if (showSuccessCard && lastCreated) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 max-w-xl mx-auto text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Registro Exitoso
          </span>
          <h3 className="text-xl font-bold text-slate-800">
            Material Odontológico Guardado
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Se ha dado de alta con éxito el material{' '}
            <strong className="text-slate-800">{lastCreated.nombre}</strong> con código{' '}
            <span className="font-mono font-bold text-primary-600">{lastCreated.codigo}</span>.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-slate-400 block">Código</span>
            <span className="font-semibold text-slate-700">{lastCreated.codigo}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Unidad de Medida</span>
            <span className="font-semibold text-slate-700">{lastCreated.unidadMedida}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Stock Inicial</span>
            <span className="font-semibold text-slate-700">{lastCreated.stockActual} unidades</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Stock Mínimo Alerta</span>
            <span className="font-semibold text-slate-700">{lastCreated.stockMinimo} unidades</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <i className="bi bi-plus-lg mr-2"></i>
            Registrar Otro Material
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onRedirectToList}
            className="w-full sm:w-auto"
          >
            <i className="bi bi-box-seam mr-2"></i>
            Ir al Listado de Materiales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto">
      <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-base">
              <i className="bi bi-tools"></i>
            </span>
            Registrar Material Odontológico
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Alta de resinas, instrumental y fungibles clínicos (PBI-AsisDent-01 / DENTALCARE-26)
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
          Prefijo MT
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código del Material */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Código del Material <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: MT78"
                className={`w-full text-sm rounded-xl px-3.5 py-2.5 transition-all outline-none font-mono ${
                  errores.codigo
                    ? 'border-2 border-red-500 bg-red-50/50 text-red-900 placeholder-red-300 ring-2 ring-red-100'
                    : 'border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                }`}
              />
              {errores.codigo && (
                <i className="bi bi-exclamation-circle-fill text-red-500 absolute right-3 top-3 text-sm"></i>
              )}
            </div>
            {errores.codigo ? (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1 animate-fadeIn">
                <i className="bi bi-info-circle text-[11px]"></i> {errores.codigo}
              </p>
            ) : (
              <p className="text-slate-400 text-[11px] mt-1">Nomenclatura clínica: MT + dígitos</p>
            )}
          </div>

          {/* Unidad de Medida */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unidad de Medida <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="unidadMedida"
              value={formData.unidadMedida}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej: Jeringa 4g, Caja x 100, Frasco"
              className={`w-full text-sm rounded-xl px-3.5 py-2.5 transition-all outline-none ${
                errores.unidadMedida
                  ? 'border-2 border-red-500 bg-red-50/50 text-red-900 ring-2 ring-red-100'
                  : 'border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
              }`}
            />
            {errores.unidadMedida && (
              <p className="text-red-600 text-xs mt-1">{errores.unidadMedida}</p>
            )}
          </div>
        </div>

        {/* Nombre del Material */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nombre del Material <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej: Resina Fotocurable A2 Universal"
              className={`w-full text-sm rounded-xl px-3.5 py-2.5 transition-all outline-none ${
                errores.nombre
                  ? 'border-2 border-red-500 bg-red-50/50 text-red-900 placeholder-red-300 ring-2 ring-red-100'
                  : 'border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
              }`}
            />
            {errores.nombre && (
              <i className="bi bi-exclamation-circle-fill text-red-500 absolute right-3 top-3 text-sm"></i>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1">
            {errores.nombre ? (
              <span className="text-red-600 flex items-center gap-1">
                <i className="bi bi-info-circle text-[11px]"></i> {errores.nombre}
              </span>
            ) : (
              <span className="text-slate-400">Requerido entre 5 y 100 caracteres</span>
            )}
            <span className={`${formData.nombre.length < 5 || formData.nombre.length > 100 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
              {formData.nombre.length}/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stock Inicial */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stock Inicial en Almacén
            </label>
            <input
              type="number"
              name="stockActual"
              min="0"
              value={formData.stockActual}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full text-sm rounded-xl px-3.5 py-2.5 transition-all outline-none ${
                errores.stockActual
                  ? 'border-2 border-red-500 bg-red-50/50 text-red-900 ring-2 ring-red-100'
                  : 'border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
              }`}
            />
            {errores.stockActual && (
              <p className="text-red-600 text-xs mt-1">{errores.stockActual}</p>
            )}
          </div>

          {/* Stock Mínimo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stock Mínimo (Alerta de Reabastecimiento)
            </label>
            <input
              type="number"
              name="stockMinimo"
              min="0"
              value={formData.stockMinimo}
              onChange={handleChange}
              className="w-full text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
            <p className="text-slate-400 text-[11px] mt-1">Alerta cuando las existencias bajen de este valor</p>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Descripción o Especificaciones Clínicas (Opcional)
          </label>
          <textarea
            name="descripcion"
            rows="2"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Indicaciones de uso, marca o condiciones de almacenamiento..."
            className="w-full text-sm rounded-xl px-3.5 py-2 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
          ></textarea>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={submitting}
          >
            Limpiar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
          >
            <i className="bi bi-save mr-2"></i>
            Guardar Material
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MaterialForm;
