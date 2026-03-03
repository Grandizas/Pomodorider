<template>
    <div class="privacy policy-page">
        <h1>Privacy Policy</h1>
        <p>Last updated: March 2026</p>

        <h2>1. Introduction</h2>
        <p>
            Pomodorider is a simple productivity timer application. Your privacy
            is important. This policy explains what data is collected and how it
            is used.
        </p>

        <h2>2. Personal Data</h2>
        <p>
            Pomodorider does not require account registration and does not
            collect personal information such as name, email address, or payment
            details.
        </p>

        <h2>3. Local Storage</h2>
        <p>
            Timer settings and preferences (such as theme or duration) are
            stored locally in your browser using localStorage. This data never
            leaves your device.
        </p>

        <h2>4. Analytics</h2>
        <p>
            Pomodorider uses Vercel Web Analytics to collect anonymous usage
            statistics such as page views, general location (country level), and
            device type.
        </p>
        <p>
            No cookies are used for tracking purposes and no personally
            identifiable information is collected.
        </p>

        <h2>5. Third-Party Services</h2>
        <p>
            The website is hosted on Vercel, which may process technical data
            such as IP addresses for security and infrastructure purposes.
        </p>

        <h2>6. Data Sharing</h2>
        <p>No personal data is sold, rented, or shared with third parties.</p>

        <h2>7. Contact</h2>
        <p>
            If you have questions about this Privacy Policy, you can contact the
            project maintainer via GitHub.
        </p>
    </div>
</template>

<script setup lang="ts">
import { useHead } from '#imports';

definePageMeta({
    layout: 'policy',
});

useHead({
    title: 'Pomodorider Privacy Policy',
    meta: [
        {
            name: 'description',
            content: 'Pomodorider Privacy Policy',
        },
    ],
});
</script>

<style scoped lang="scss"></style>
