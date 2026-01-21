import { useState } from "react";
import api from "../api/axios";
import MainLayout from "../components/Layout/MainLayout";

export default function Parametres() {
    return (
        <MainLayout title="Paramètres">
            <div>
                les paramètres.
            </div>
        </MainLayout>
    );
}