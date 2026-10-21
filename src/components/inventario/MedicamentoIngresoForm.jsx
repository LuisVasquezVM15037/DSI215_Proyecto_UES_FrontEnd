import React, { useState } from 'react';
import Button from '../ui/Button';

export const MedicamentoIngresoForm = ({ onRegistrarIngreso, onRedirectToList }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    presentacion: 'Caja x 30 cápsulas',
    lote: '',
    fechaVencimiento: '',
    cantidadIngreso: 10,
    stockMinimo: 5,
  });

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  // Validaciones según AC de DENTALCARE-48
  const esCodigoValido = (cod) => /^MD\d+$/i.test(cod?.trim() || '');
  const esNombreValido = (nom) => {
    const len = nom?.trim().length || 0;
    return len >= 5 && len <= 100;
  };
  const esCantidadValida = (cant) => Number(cant) >= 1;

  const errores = {
    codigo: touched.codigo && !esCodigoValido(formData.codigo)
      ? 'El código debe comenzar con MD seguido de números (ej: MD45)'
      : null,
    nombre: touched.nombre && !esNombreValido(formData.nombre)
      ? 'El nombre debe tener entre 5 y 100 caracteres'
      : null,
    cantidadIngreso: touched.cantidadIngreso && !esCantidadValida(formData.cantidadIngreso)
      ? 'La cantidad a ingresar debe ser mayor o igual a 1'
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
      cantidadIngreso: true,
    });

    if (
      !esCodigoValido(formData.codigo) ||
      !esNombreValido(formData.nombre) ||
      !esCantidadValida(formData.cantidadIngreso)
    ) {
      return;
    }

    setSubmitting(true);
    const res = await onRegistrarIngreso({
      ...formData,
      codigo: formData.codigo.trim().toUpperCase(),
      nombre: formData.nombre.trim(),
      presentacion: formData.presentacion?.trim() || 'Unidad estándar',
      lote: formData.lote?.trim() || null,
      fechaVencimiento: formData.fechaVencimiento || null,
      cantidadIngreso: parseInt(formData.cantidadIngreso, 10),
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
      presentacion: 'Caja x 30 cápsulas',
      lote: '',
      fechaVencimiento: '',
      cantidadIngreso: 10,
      stockMinimo: 5,
    });
    setTouched({});
    setShowSuccessCard(false);
    setLastCreated(null);
  };

  if (showSuccessCard && lastCreated) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 max-w-xl mx-auto text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          <i className="bi bi-capsule-pill"></i>
        </div>
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Ingreso Confirmado
          </span>
          <h3 className="text-xl font-bold text-slate-800">
            Medicamento Ingresado al Inventario
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Se registraron existencias para{' '}
            <strong className="text-slate-800">{lastCreated.nombre}</strong> con código{' '}
            <span className="font-mono font-bold text-dental-600">{lastCreated.codigo}</span>.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-slate-400 block">Código</span>
            <span className="font-semibold text-slate-700">{lastCreated.codigo}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Presentación</span>
            <span className="font-semibold text-slate-700">{lastCreated.presentacion}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Stock Total Actual</span>
            <span className="font-bold text-emerald-600 text-base">{lastCreated.stockActual} unidades</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Lote / Vencimiento</span>
            <span className="font-semibold text-slate-700">
              {lastCreated.lote || 'Sin lote'} • {lastCreated.fechaVencimiento || 'N/A'}
            </span>
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
            Ingresar Otro Medicamento
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onRedirectToList}
            className="w-full sm:w-auto"
          >
            <i className="bi bi-box-seam mr-2"></i>
            Ir al Listado de Medicamentos
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
            <span className="w-8 h-8 rounded-lg bg-dental-50 text-dental-600 flex items-center justify-center text-base">
              <i className="bi bi-capsule"></i>
            </span>
            Registrar Ingreso de Medicamento
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Abastecimiento de fármacos clínicos y anestésicos (PBI-AsisDent-04 / DENTALCARE-48)
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
          Prefijo MD
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código del Medicamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Código del Fármaco <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: MD45"
                className={`w-full text-sm rounded-xl px-3.5 py-2.5 transition-all outline-none font-mono ${
                  errores.codigo
                    ? 'border-2 border-red-500 bg-red-50/50 text-red-900 placeholder-red-300 ring-2 ring-red-100'
                    : 'border border-slate-200 focus:border-dental-500 focus:ring-2 focus:ring-dental-100'
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
              <p className="text-slate-400 text-[11px] mt-1">Nomenclatura institucional: MD + dígitos</p>
            )}
          </div>

          {/* Cantidad a Ingresar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cantidad de Ingreso <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="cantidadIngreso"
                min="1"
                value={formData.cantidadIngreso}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full text-sm rounded-xl px-3.5 py-2.5 transition-all outline-none font-bold ${
                  errores.cantidadIngreso
                    ? 'border-2 border-red-500 bg-red-50/50 text-red-900 ring-2 ring-red-100'
                    : 'border border-slate-200 focus:border-dental-500 focus:ring-2 focus:ring-dental-100'
                }`}
              />
              {errores.cantidadIngreso && (
                <i className="bi bi-exclamation-circle-fill text-red-500 absolute right-3 top-3 text-sm"></i>
              )}
            </div>
            {errores.cantidadIngreso ? (
              <p className="text-red-600 text-xs mt-1">{errores.cantidadIngreso}</p>
            ) : (
              <p className="text-slate-400 text-[11px] mt-1">Debe ser mayor a 0</p>
            )}
          </div>
        </div>

        {/* Nombre del Medicamento */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nombre del Medicamento / Principio Activo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej: Amoxicilina 500mg cápsulas"
              className={`w-full text-sm rounded-xl px-3.5 py-2.5 transition-all outline-none ${
                errores.nombre
                  ? 'border-2 border-red-500 bg-red-50/50 text-red-900 placeholder-red-300 ring-2 ring-red-100'
                  : 'border border-slate-200 focus:border-dental-500 focus:ring-2 focus:ring-dental-100'
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
              <span className="text-slate-400">Entre 5 y 100 caracteres</span>
            )}
            <span className={`${formData.nombre.length < 5 || formData.nombre.length > 100 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
              {formData.nombre.length}/100
            </span>
          </div>
        </div>

        {/* Presentación */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Presentación Comercial
          </label>
          <input
            type="text"
            name="presentacion"
            value={formData.presentacion}
            onChange={handleChange}
            placeholder="Ej: Frasco Gotero 15ml, Caja x 24 comprimidos, Ampolla 2ml"
            className="w-full text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-dental-500 focus:ring-2 focus:ring-dental-100 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Lote */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número de Lote
            </label>
            <input
              type="text"
              name="lote"
              value={formData.lote}
              onChange={handleChange}
              placeholder="Ej: LOT-2026-X9"
              className="w-full text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-dental-500 focus:ring-2 focus:ring-dental-100 outline-none"
            />
          </div>

          {/* Fecha de Vencimiento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              name="fechaVencimiento"
              value={formData.fechaVencimiento}
              onChange={handleChange}
              className="w-full text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-dental-500 focus:ring-2 focus:ring-dental-100 outline-none"
            />
          </div>

          {/* Stock Mínimo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stock Mínimo Alerta
            </label>
            <input
              type="number"
              name="stockMinimo"
              min="0"
              value={formData.stockMinimo}
              onChange={handleChange}
              className="w-full text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-dental-500 focus:ring-2 focus:ring-dental-100 outline-none"
            />
          </div>
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
            className="!bg-dental-600 hover:!bg-dental-700 focus:!ring-dental-200"
          >
            <i className="bi bi-box-arrow-in-down mr-2"></i>
            Ingresar al Inventario
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MedicamentoIngresoForm;
