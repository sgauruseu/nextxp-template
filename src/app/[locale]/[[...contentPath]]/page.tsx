import {FetchContentResult, validateData} from "@enonic/nextjs-adapter";
import {fetchContent, fetchContentPathsForAllLocales} from "@enonic/nextjs-adapter/server";
import MainView from '@enonic/nextjs-adapter/views/MainView';

import "../../../components/_mappings";
import {Metadata} from 'next';
import {draftMode} from 'next/headers';
import React from 'react';

// NB. Using this option with default value bails out static generation !!!
// export const dynamic = 'auto'

// The revalidate option is only available when using the Node.js Runtime.
// This means using the revalidate option with runtime = 'edge' will not work.
export const revalidate = 3600

export type PageProps = {
    locale: string,
    contentPath: string[],
}

export default async function Page({params}: { params: PageProps }) {
    const {isEnabled: draft} = draftMode();
    console.info(`Accessing page${draft ? ' (draft)' : ''}`, params);

    const start = Date.now();
    const data: FetchContentResult = await fetchContent(params);
    const duration = Date.now() - start;

    console.info(`Page fetch took ${duration} ms`);

    validateData(data);

    return (
        <MainView {...data}/>
    )
};

export async function generateMetadata({params}: { params: PageProps }): Promise<Metadata> {
    const {common} = await fetchContent(params);
    return {
        title: common?.get?.displayName || 'Not found',
    };
}

export async function generateStaticParams(props: { params: PageProps }): Promise<any[]> {
    return await fetchContentPathsForAllLocales('\${site}/');
}
