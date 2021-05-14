import * as React from 'react'

import algoliasearch, {SearchClient} from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';

import { View } from "./HierarchicalDevicePicker"

interface AlgoliaDevicePickerProps {
   onSubmit: (title: string) => void;
   onCancel: () => void;
   allowOrphan?: boolean;
   initialDevice?: string;
   initialView?: View;
   objectName?: string;
   algoliaConfig: AlgoliaConfig;
}

export interface AlgoliaConfig {
   apiKey: string;
   appId: string;
   indexPrefix: string;
}

export function AlgoliaDevicePicker(props: AlgoliaDevicePickerProps) {
   const searchClient = algoliasearch(props.algoliaConfig.appId, props.algoliaConfig.apiKey);

   return <AlgoliaSearchRoot searchClient={searchClient} {...props} />;
}

function AlgoliaSearchRoot(props: AlgoliaDevicePickerProps & {searchClient: SearchClient}) {
   const indexRoot = 'topic';
   const langid = 'en';
   const indexName = `${props.algoliaConfig.indexPrefix}${indexRoot}_${langid}`
   return <InstantSearch searchClient={props.searchClient} indexName={indexName}>
      <SearchBox />
      <Hits />
   </InstantSearch>
}

interface DeviceHit {
   __position: number;
   _highlightResult: any;
   _snippetResult: any;
   all_titles: Array<string>;
   answers_url: string;
   description: string;
   device: string;
   doctype: string;
   flags: Array<any>;
   has_image: number;
   headings: Array<string>;
   image_url: string;
   langid: string;
   modified_date: number;
   namespace: string;
   objectID: string;
   objectType: string;
   parts_url: null|string;
   public: number;
   score_device_posts: number;
   score_wiki_views: number;
   site: string;
   tags: Array<any>;
   title: string;
   url: string;
   userid: number;
   wikiid: number;
}
