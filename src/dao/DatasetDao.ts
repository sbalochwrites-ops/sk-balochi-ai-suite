import { AppDatabase } from '../database/AppDatabase';
import {
  CloudAssistTopicEntity,
  DatasetOptionEntity,
} from '../database/entities';

export class DatasetDao {
  private db = AppDatabase.getInstance();

  public getAllDatasets(): DatasetOptionEntity[] {
    return this.db.getState().datasets;
  }

  public getCloudAssistTopics(): CloudAssistTopicEntity[] {
    return this.db.getState().cloudTopics;
  }

  public addPromptToDataset(
    datasetId: string,
    prompt: {
      title: string;
      promptText: string;
      variables: string[];
      expectedOutput: string;
    }
  ): void {
    this.db.updateState((prev) => ({
      ...prev,
      datasets: prev.datasets.map((ds) =>
        ds.id === datasetId
          ? {
              ...ds,
              samplePrompts: [
                { id: `pr-${Date.now()}`, ...prompt },
                ...ds.samplePrompts,
              ],
            }
          : ds
      ),
    }));
  }
}

export const datasetDao = new DatasetDao();
