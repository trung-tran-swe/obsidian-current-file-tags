import {CachedMetadata, IconName, ItemView, TAbstractFile, TFile, WorkspaceLeaf} from "obsidian";
import {StrictMode} from "react";
import {createRoot, Root} from "react-dom/client";

import CurrentFileTagsPlugin from "./main";
import FileTags from "./file-tags";


export const NAME_TAG = "Current file tags";
export const MAIN_VIEW = "current-file-tags-view";
export const MARKDOWN_EDITOR_VIEW = "markdown";


/**
 * The main view for the plugin.
 */
export class MainView extends ItemView {

    root: Root | null = null;
    plugin: CurrentFileTagsPlugin;
    activeFile: TFile | null = null;
    activeTags: string[] = [];


    constructor(leaf: WorkspaceLeaf, plugin: CurrentFileTagsPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.resetTags(null);

        // Use app.workspace "active-leaf-change" to determine if changed to a new Markdown file
        // to reset the view
        plugin.registerEvent(
            this.app.workspace.on("active-leaf-change", (leaf: WorkspaceLeaf | null) => {
                // Only care about markdown editor leaf
                if (leaf?.view.getViewType() != MARKDOWN_EDITOR_VIEW) {
                    return;
                }
                if (this.resetActiveFile() &&
                    this.resetTags(null)
                ) {
                    this.render();
                }
            })
        );

        // Use metadataCache "changed" to determine if tags info changed and refresh as appropriate.
        plugin.registerEvent(
            this.app.metadataCache.on("changed", (file: TFile, _data: string, cache: CachedMetadata) => {
                if (this.activeFile == file &&
                    this.resetTags(cache)
                ) {
                    this.render();
                }
            })
        );

        // TODO when file closed, need to refresh active file

        // Use vault "create" to catch a new file is created
        // and determine if a refresh is needed.
        // A new Markdown file might change the active file
        // (which might not set the active-leaf-change event)
        plugin.registerEvent(
            this.app.vault.on("create", (_file: TAbstractFile) => {
                if (this.resetActiveFile() &&
                    this.resetTags(null)
                ) {
                    this.render();
                }
            })
        );

        // Use vault "delete" to determine if the current active file is deleted.
        plugin.registerEvent(
            this.app.vault.on("delete", (file: TAbstractFile) => {
                if (this.activeFile == file) {
                    this.activeFile = null;
                    this.activeTags = [];
                    this.render();
                }
            })
        );
    }

    /**
     * Compare 2 arrays.
     * @param a Array 1.
     * @param b Array 2.
     * @return True if both are identical; False otherwise.
     */
    arrayEquals(a: any[], b: any[]): boolean {
        return (
            a.length == b.length &&
            a.every((v, idx) => v === b[idx])
        );
    }

    /**
     * Try to reset the activeTags using the cache if available.
     * If cache is not available, try the cache from the activeFile if available.
     * @param cache The CachedMetadata if available.
     * @return True if activeTags updated; False otherwise.
     */
    resetTags(cache: CachedMetadata | null): boolean {
        let newTags: string[] = [];
        if (cache == null && this.activeFile) {
            cache = this.app.metadataCache.getFileCache(this.activeFile);
            // Cache can still be null
        }
        if (cache) {
            // Get all unique tags for the active file
            const tagsSet = new Set(cache?.tags?.map(a => a.tag));
            // Get the frontmatter "tags"
            cache?.frontmatter?.tags.forEach((tag: string) => {
                tagsSet.add(tag);
            })
            newTags = [...tagsSet];
            newTags.sort();
        }
        if (!this.arrayEquals(this.activeTags, newTags)) {
            this.activeTags = newTags;
            return true;
        }
        return false;
    }

    /**
     * Try to reset the activeFile if it has changed.
     * @return True if activeFile is updated; False otherwise.
     */
    resetActiveFile(): boolean {
        const curActiveFile: TFile | null = this.app.workspace.getActiveFile();
        if (this.activeFile != curActiveFile) {
            this.activeFile = curActiveFile;
            return true;
        }
        return false;
    }

    getViewType() {
        return MAIN_VIEW;
    }

    getDisplayText() {
        return NAME_TAG;
    }

    getIcon(): IconName {
        return "tag";
    }

    async onOpen() {
        this.activeFile = this.app.workspace.getActiveFile();
        this.root = createRoot(this.containerEl.children[1]);
        this.render();
    }

    async onClose() {
        this.root?.unmount();
    }

    /**
     * Search for the tag using the Search plugin.
     * @param tag The tag to search for.
     */
    searchTag(tag: string) {
        const uri = `obsidian://search?query=tag:${encodeURIComponent(tag.substring(1))}`;
        const searchEl = document.createElement("a");
        searchEl.href = uri;
        document.body.appendChild(searchEl);
        searchEl.click();
        document.body.removeChild(searchEl);
    }

    render() {
        if (!this.root) {
            return;
        }
        this.root.render(
            <StrictMode>
                <FileTags
                    app={this.app}
                    tags={this.activeTags}
                    onSearchTag={this.searchTag}
                />
            </StrictMode>
        );
    }
}
