import { extendTheme, ThemeConfig } from "@chakra-ui/react"

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
}

const theme = extendTheme(
    {config},
    {
        colors: {
            brand: {
            100: "#086F83",
            },
        },
        styles:{
            global: ()=>({
                body: {
                    bg: "whiteAlpha.200"
                }
            })
        }
    }
)