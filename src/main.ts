import {Plugin, WorkspaceLeaf} from "obsidian";
import {MAIN_VIEW, MainView, NAME_TAG} from "./main-view";

/**
 * A simple Obsidian plugin that:
 * - Shows the tags of the currently active Markdown file.
 * - Clicking on the tag shows the files contain the tag.
 * - Ctrl + Click on the tag initiate the Search functionality on the tag.
 */
export default class CurrentFileTagsPlugin extends Plugin {

    async onload() {
        this.registerView(MAIN_VIEW, (leaf) => new MainView(leaf, this));

        this.addRibbonIcon("tag", NAME_TAG, () => this.activateView());
    }

    async activateView() {
        let leaf: WorkspaceLeaf | null = this.app.workspace.getLeavesOfType(MAIN_VIEW).first() || null;
        if (!leaf) {
            leaf = this.app.workspace.getRightLeaf(false);
            await leaf?.setViewState({type: MAIN_VIEW, active: true});
        }
        if (leaf)
            await this.app.workspace.revealLeaf(leaf);
    }
}
