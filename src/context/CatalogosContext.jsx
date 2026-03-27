import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import AuthContext from "./AuthContext";

const CatalogosContext = createContext();

export function CatalogosProvider({ children }) {
    const [roles, setRoles] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [farmacias, setFarmacias] = useState([]);
    const [almacenes, setAlmacenes] = useState([]);
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
        setLoading(true);
        try {
            const [
                rolesRes,
                empresasRes,
                farmaciasRes,
                almacenesRes,
                categoriasRes,
                clasificacionesRes,
                presentacionesRes,
                viasRes,
                tiposRes,
            ] = await Promise.all([
                api.get('/roles'),
                api.get('/empresas'),
                api.get('/farmacias'),
                api.get('/almacenes'),
                api.get('/categorias-producto'),
                api.get('/clasificaciones-producto'),
                api.get('/presentaciones-producto'),
                api.get('/vias-administracion'),
                api.get('/tipos-movimiento'),
            ]);
            setRoles(rolesRes.data);
            setEmpresas(empresasRes.data);
            setFarmacias(farmaciasRes.data);
            setAlmacenes(almacenesRes.data);
            setCategoriasProducto(categoriasRes.data);
            setClasificacionesProducto(clasificacionesRes.data);
            setPresentacionesProducto(presentacionesRes.data);
            setViasAdministracion(viasRes.data);
            setTiposMovimiento(tiposRes.data);
        } catch (e) {
            console.error('Error cargando catálogos:', e);
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