import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import AuthContext from "./AuthContext";

const CatalogosContext = createContext();

export function CatalogosProvider({ children }) {
    const [roles, setRoles] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [farmacias, setFarmacias] = useState([]);
    const [almacenes, setAlmacenes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [controlCalidad, setControlCalidad] = useState([]);
    const [recepcionAlmacen, setRecepcionAlmacen] = useState([]);
    const [categoriasProducto, setCategoriasProducto] = useState([]);
    const [clasificacionesProducto, setClasificacionesProducto] = useState([]);
    const [presentacionesProducto, setPresentacionesProducto] = useState([]);
    const [viasAdministracion, setViasAdministracion] = useState([]);
    const [tiposMovimiento, setTiposMovimiento] = useState([]);
    const [loading, setLoading] = useState(false);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) fetchCatalogos();
    }, [user]);

    const fetchCatalogos = async () => {
        console.log("Permisos detectados en el contexto global:", user?.permisos);
        if (!user || !user.permisos) return;

        setLoading(true);

        const configuracionCatalogos = [
            { clave: 'GROL', endpoint: '/roles', setter: setRoles },
            { clave: 'GPER', endpoint: '/empresas', setter: setEmpresas },
            { clave: 'GFAR', endpoint: '/farmacias', setter: setFarmacias },
            { clave: 'GALM', endpoint: '/almacenes', setter: setAlmacenes },
            { clave: 'GMOV', endpoint: '/inventario', setter: setInventario },
            { clave: 'GCDC', endpoint: '/control-calidad', setter: setControlCalidad },
            { clave: 'GORD', endpoint: '/ordenes', setter: setMovimientos },
            { clave: 'RECP', endpoint: '/recepcion-inventario', setter: setRecepcionAlmacen },
            { clave: 'GPRO', endpoint: '/productos', setter: setProductos },
            { clave: 'GCAT', endpoint: '/categorias-producto', setter: setCategoriasProducto },
            { clave: 'GCLA', endpoint: '/clasificaciones-producto', setter: setClasificacionesProducto },
            { clave: 'GPRE', endpoint: '/presentaciones-producto', setter: setPresentacionesProducto },
            { clave: 'GVIA', endpoint: '/vias-administracion', setter: setViasAdministracion },
            { clave: 'GTIP', endpoint: '/tipos-movimiento', setter: setTiposMovimiento },
        ];

        // 🌟 Filtramos estrictamente leyendo el arreglo de permisos del backend
        const catalogosPermitidos = configuracionCatalogos.filter(item => {
            return user.permisos.includes(item.clave);
        });

        try {
            const promesas = catalogosPermitidos.map(item => api.get(item.endpoint));
            const resultados = await Promise.allSettled(promesas);

            resultados.forEach((res, index) => {
                const configItem = catalogosPermitidos[index];
                if (res.status === "fulfilled") {
                    configItem.setter(res.value.data);
                } else {
                    console.error(`Error en catálogo [${configItem.endpoint}]:`, res.reason);
                    configItem.setter([]);
                }
            });

        } catch (e) {
            console.error('Error crítico inesperado cargando catálogos:', e);
        } finally {
            setLoading(false);
        }
    };

    const refreshCatalogo = async (catalogo, nuevosDatos = null) => {
        const setters = {
            roles: setRoles,
            empresas: setEmpresas,
            farmacias: setFarmacias,
            almacenes: setAlmacenes,
            productos: setProductos,
            movimientos: setMovimientos,
            inventario: setInventario,
            controlCalidad: setControlCalidad,
            recepcionAlmacen: setRecepcionAlmacen,
            categoriasProducto: setCategoriasProducto,
            clasificacionesProducto: setClasificacionesProducto,
            presentacionesProducto: setPresentacionesProducto,
            viasAdministracion: setViasAdministracion,
            tiposMovimiento: setTiposMovimiento,
        };

        if (nuevosDatos) {
            setters[catalogo](nuevosDatos);
            return;
        }

        const endpoints = {
            roles: '/roles',
            empresas: '/empresas',
            farmacias: '/farmacias',
            almacenes: '/almacenes',
            productos: '/productos',
            movimientos: '/movimientos',
            inventario: '/inventario',
            controlCalidad: '/control-calidad',
            recepcionAlmacen: '/recepcion-inventario',
            categoriasProducto: '/categorias-producto',
            clasificacionesProducto: '/clasificaciones-producto',
            presentacionesProducto: '/presentaciones-producto',
            viasAdministracion: '/vias-administracion',
            tiposMovimiento: '/tipos-movimiento',
        };

        try {
            const res = await api.get(endpoints[catalogo]);
            setters[catalogo](res.data);
        } catch (e) {
            console.error('Error recargando catálogo:', e);
        }
    };

    return (
        <CatalogosContext.Provider value={{
            roles,
            empresas,
            farmacias,
            almacenes,
            productos,
            movimientos,
            inventario,
            controlCalidad,
            recepcionAlmacen,
            categoriasProducto,
            clasificacionesProducto,
            presentacionesProducto,
            viasAdministracion,
            tiposMovimiento,
            loading,
            refreshCatalogo,
        }}>
            {children}
        </CatalogosContext.Provider>
    );
}

export function useCatalogos() {
    return useContext(CatalogosContext);
}