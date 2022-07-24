function fallbackTheme () {
    try {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        } else return 'light';
    } catch (err) {
        return 'light';
    }
}

export default function () {
    var theme = localStorage.getItem('theme');
    if (!theme) theme = fallbackTheme();

    document.documentElement.setAttribute('data-theme', theme);
    return theme
}