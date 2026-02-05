import { themes } from '~~/themes/themes';
import { useThemeStore } from '~~/stores/theme';

export const useThemeVideo = () => {
    const themeStore = useThemeStore();
    const config = useRuntimeConfig();

    return computed(() => {
        const video = themes[themeStore.activeTheme].video;
        const rawBaseUrl = config?.public?.mediaBaseUrl;

        const baseUrl =
            typeof rawBaseUrl === 'string' && rawBaseUrl.length > 0
                ? rawBaseUrl.replace(/\/+$/, '')
                : '';
        if (!baseUrl) {
            // Fallback to a relative path if mediaBaseUrl is not defined or empty
            return `/videos/${video}`;
        }
        return `${baseUrl}/videos/${video}`;
    });
};
