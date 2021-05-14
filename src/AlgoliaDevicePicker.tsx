import * as React from 'react'

import algoliasearch, {SearchClient} from 'algoliasearch/lite';
import { InstantSearch, SearchBox, connectHits } from 'react-instantsearch-dom';
import GridItem from "./GridItem"
import { Grid } from "./GridExplorer"

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
      <AlgoliaHitsList />
   </InstantSearch>
}

function HitsList({ hits }: { hits: DeviceHit[] }) {
   return <Grid>
      {hits.map(hit => {
         return <HitBox hit={hit} />
      })}
   </Grid>
}

const AlgoliaHitsList = connectHits(HitsList);

interface HitBoxProps {
   hit: DeviceHit;
}

function HitBox({hit}: HitBoxProps) {
   return <GridItem
      title={hit.title}
      image={hit.image_url}
      onClick={() => console.log("Clicked %s", hit.title)}
   />
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
