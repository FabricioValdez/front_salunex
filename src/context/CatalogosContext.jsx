import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import AuthContext from "./AuthContext";

const CatalogosContext = createContext();

export function CatalogosProvider({ children }) {
    const [roles, setRoles]                             = useState([]);
    const [empresas, setEmpresas]                       = useState([]);
    const [farmacias, setFarmacias]                     = useState([]);
    const [almacenes, setAlmacenes]                     = useState([]);
    const [productos, setProductos]                     = useState([]);
    const [movimientos, setMovimientos]                 = useState([]);
    const [inventario, setInventario]                   = useState([]);
    const [categoriasProducto, setCategoriasProducto]   = useState([]);
    const [clasificacionesProducto, setClasificacionesProducto] = useState([]);
    const [presentacionesProducto, setPresentacionesProducto]   = useState([]);
    const [viasAdministracion, setViasAdministracion]           = useState([]);
    const [tiposMovimiento, setTiposMovimiento]                 = useState([]);
    const [loading, setLoading]                                 = useState(false);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) fetchCatalogos();
    }, [user]);

    const fetchCatalogos = async () => {
        if (!user || !user.permisos) return;
        
        setLoading(true);
        
        // Mapeo de qué clave de módulo desbloquea qué endpoint de catálogo
        const configuracionCatalogos = [
            { clave: 'GROL', endpoint: '/roles', setter: setRoles },
            { clave: 'GPER', endpoint: '/empresas', setter: setEmpresas },
            { clave: 'GFAR', endpoint: '/farmacias', setter: setFarmacias },
            { clave: 'GALM', endpoint: '/almacenes', setter: setAlmacenes },
            { clave: 'GPRO', endpoint: '/productos', setter: setProductos },
            { clave: 'GMOV', endpoint: '/movimientos', setter: setMovimientos },
            { clave: 'GALM', endpoint: '/inventario', setter: setInventario },
            { clave: 'GPRO', endpoint: '/categorias-producto', setter: setCategoriasProducto },
            { clave: 'GPRO', endpoint: '/clasificaciones-producto', setter: setClasificacionesProducto },
            { clave: 'GPRO', endpoint: '/presentaciones-producto', setter: setPresentacionesProducto },
            { clave: 'GPRO', endpoint: '/vias-administracion', setter: setViasAdministracion },
            { clave: 'GPER', endpoint: '/tipos-movimiento', setter: setTiposMovimiento },
        ];

        // 🌟 Filtramos únicamente los endpoints para los cuales el usuario tiene permiso
        const catalogosPermitidos = configuracionCatalogos.filter(item => 
            user.permisos.includes(item.clave)
        );

        try {
            // Ejecutamos en paralelo solo los permitidos
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
            roles:                   setRoles,
            empresas:                setEmpresas,
            farmacias:               setFarmacias,
            almacenes:               setAlmacenes,
            productos:               setProductos,
            movimientos:             setMovimientos,
            inventario:              setInventario,
            categoriasProducto:      setCategoriasProducto,
            clasificacionesProducto: setClasificacionesProducto,
            presentacionesProducto:  setPresentacionesProducto,
            viasAdministracion:      setViasAdministracion,
            tiposMovimiento:         setTiposMovimiento,
        };

        if (nuevosDatos) {
            setters[catalogo](nuevosDatos);
            return;
        }

        const endpoints = {
            roles:                   '/roles',
            empresas:                '/empresas',
            farmacias:               '/farmacias',
            almacenes:               '/almacenes',
            productos:               '/productos',
            movimientos:             '/movimientos',
            inventario:              '/inventario',
            categoriasProducto:      '/categorias-producto',
            clasificacionesProducto: '/clasificaciones-producto',
            presentacionesProducto:  '/presentaciones-producto',
            viasAdministracion:      '/vias-administracion',
            tiposMovimiento:         '/tipos-movimiento',
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