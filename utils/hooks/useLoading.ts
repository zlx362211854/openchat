import { useState } from "react";


export function useLoading() {
    const [loading, setLoading] = useState<boolean>(false)

    const showLoading = () => {
        setLoading(true)
    }

    const hideLoading = () => {
        setLoading(false)
    }
    return {
        loading,
        showLoading,
        hideLoading
    }
}