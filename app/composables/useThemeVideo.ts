import { themes } from '~~/themes/themes';
import { useThemeStore } from '~~/stores/theme';

export const useThemeVideo = () => {
    const themeStore = useThemeStore();
    const config = useRuntimeConfig();

    return computed(() => {
        const video = themes[themeStore.activeTheme].video;
        return `${config.public.mediaBaseUrl}/videos/${video}`;
    });
};
