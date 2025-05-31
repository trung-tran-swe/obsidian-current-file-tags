import {App, TFile, WorkspaceLeaf} from "obsidian";
import {memo} from "react";
import {MARKDOWN_EDITOR_VIEW} from "./main-view";


/**
 * Render the files containing the tag.
 * - param app The Obsidian App.
 * - param tag The tag, without the #, to find files containing it.
 * @constructor
 */
function TagFiles(
    {
        app,
        tag
    }: {
        app: App;
        tag: string | null;
    }) {

    if (!tag) {
        return null;
    }

    function shorten(path: string, maxLen: number): string {
        if (path.length > maxLen) {
            return "..." + path.substring(path.length - maxLen);
        }
        return path;
    }

    // tag expects to have # in front
    function hasTag(file: TFile, selectedTag: string): boolean {
        // Check against metadata tags
        let res = false;
        const cache = app.metadataCache.getFileCache(file);
        if (cache) {
            // Get all tags from cache and frontmatter.tags
            const tagsSet = new Set(cache?.tags?.map(a => a.tag.substring(1)));
            cache?.frontmatter?.tags?.forEach((tag: string) => {
                tagsSet.add(tag);
            })
            const tags = [...tagsSet];
            tags.every((t: string) => {
                if (t == selectedTag) {
                    res = true;
                    return false;
                }
                return true;
            });
        }
        return res;
    }

    const files: TFile[] = [];
    app.vault.getMarkdownFiles().forEach((file) => {
        if (hasTag(file, tag)) {
            files.push(file);
        }
    });
    files.sort((a, b): number => {
        if (a.path < b.path) {
            return 1;
        } else if (a.path > b.path) {
            return -1;
        }
        return 0;
    });

    return (
        <div className="cft-tag-files">
            <span className="cm-formatting cm-formatting-hashtag cm-hashtag cm-hashtag-begin cm-meta">#</span>
            <span className="cm-hashtag cm-hashtag-end cm-meta">{tag}</span>
            <span className="cft-info"> is in {files.length} file(s).</span>

            <div className="cft-files-container">
                {files.map((file: TFile) => (
                    <div
                        key={file.path}
                        className="cft-file"
                        onClick={(_e) => {
                            let leaf: WorkspaceLeaf | null =
                                this.app.workspace.getLeavesOfType(MARKDOWN_EDITOR_VIEW).first() || null;
                            leaf?.openFile(file, {active: true})
                        }}
                    >
                        {shorten(file.path, 24)}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default memo(TagFiles);
