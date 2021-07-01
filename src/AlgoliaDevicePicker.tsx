import * as React from 'react';
import { SearchContainer, SearchInput } from './HierarchicalDevicePicker';
import { Icon } from '@ifixit/toolbox';
import algoliasearch, { SearchClient } from 'algoliasearch/lite';
import {
   InstantSearch,
   connectHits,
   connectSearchBox,
} from 'react-instantsearch-dom';
import GridItem from './GridItem';
import { Grid } from './GridExplorer';
import { View } from './HierarchicalDevicePicker';
import { color } from '@core-ds/primitives';

interface AlgoliaDevicePickerProps {
   leaves: object | null;
   onSelectCategory: (category: string) => void;
   onSubmit: (title: string) => void;
   onCancel: () => void;
   allowOrphan?: boolean;
   initialDevice?: string;
   initialView?: View;
   objectName?: string;
   algoliaConfig: AlgoliaConfig;
   query?: string;
}

export interface AlgoliaConfig {
   apiKey: string;
   appId: string;
   indexPrefix: string;
}

export function AlgoliaDevicePicker(props: AlgoliaDevicePickerProps) {
   const searchClient = algoliasearch(
      props.algoliaConfig.appId,
      props.algoliaConfig.apiKey,
   );

   return <AlgoliaSearchRoot searchClient={searchClient} {...props} />;
}

function AlgoliaSearchRoot(
   props: AlgoliaDevicePickerProps & { searchClient: SearchClient },
) {
   const indexRoot = 'topic';
   const langid = 'en';
   const indexName = `${props.algoliaConfig.indexPrefix}${indexRoot}_${langid}`;
   return (
      <InstantSearch searchClient={props.searchClient} indexName={indexName}>
         <AlgoliaSearchBox defaultRefinement={props.query} />
         <AlgoliaHitsList
            leaves={props.leaves}
            onSelectCategory={props.onSelectCategory}
            onSelectLeaf={props.onSubmit}
         />
      </InstantSearch>
   );
}

function HitsList({
   hits,
   leaves,
   onSelectCategory,
   onSelectLeaf,
}: {
   hits: any[];
   leaves: any;
   onSelectCategory: (category: string) => void;
   onSelectLeaf: (title: string) => void;
}) {
   return (
      <Grid>
         {hits.map((hit) => {
            return (
               <HitBox
                  key={hit.title}
                  hit={hit}
                  onSelect={
                     leaves.has(hit.title) ? onSelectLeaf : onSelectCategory
                  }
               />
            );
         })}
      </Grid>
   );
}

interface HitBoxProps {
   hit: DeviceHit;
   onSelect: (category: string) => void;
}

function HitBox({ hit, onSelect }: HitBoxProps) {
   return (
      <GridItem
         title={hit.title}
         image={hit.image_url}
         onClick={() => onSelect(hit.title)}
      />
   );
}

function SearchBox({
   currentRefinement,
   refine,
}: {
   currentRefinement: string;
   refine: any;
}) {
   return (
      <SearchContainer>
         <Icon name="search" size={25} color={color.gray5} />
         <SearchInput
            autoFocus
            value={currentRefinement}
            onChange={(event) => refine(event.target.value)}
         />
      </SearchContainer>
   );
}

const AlgoliaSearchBox = connectSearchBox(SearchBox);
const AlgoliaHitsList = connectHits(HitsList);

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
   parts_url: null | string;
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
