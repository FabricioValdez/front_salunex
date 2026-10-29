import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import AuthContext from "./AuthContext";

const CatalogosContext = createContext();

export function CatalogosProvider({ children }) {
    const [roles, setRoles] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]); // Reemplaza farmacias y almacenes
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
        if (!user || !user.permisos) return;

        setLoading(true);

        const configuracionCatalogos = [
            { clave: 'GROL', endpoint: '/roles', setter: setRoles },
            { clave: 'GPER', endpoint: '/empresas', setter: setEmpresas },
            { clave: 'GUBI', endpoint: '/ubicaciones', setter: setUbicaciones }, // Nuevo endpoint unificado
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

        const catalogosPermitidos = configuracionCatalogos.filter(item => {
            return user.permisos.includes(item.clave);
        });

        try {
            const promesas = catalogosPermitidos.map(item => api.get(item.endpoint));
            const resultados = await Promise.allSettled(promesas);

            resultados.forEach((res, index) => {
                const configItem = catalogosPermitidos[index];
                if (res.status === "fulfilled") {
                    // Extraemos .data.data porque nuestro backend API devuelve { success: true, data: [...] }
                    const dataReal = res.value.data.data || res.value.data;
                    configItem.setter(dataReal);
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

    return (
        <CatalogosContext.Provider value={{
            roles, empresas, ubicaciones, productos, movimientos, inventario,
            controlCalidad, recepcionAlmacen, categoriasProducto, clasificacionesProducto,
            presentacionesProducto, viasAdministracion, tiposMovimiento, loading
        }}>
            {children}
        </CatalogosContext.Provider>
    );
}

export function useCatalogos() {
    return useContext(CatalogosContext);
}