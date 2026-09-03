import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { environment } from '../../../environments/environment';

export interface Category {
  id: string;
  name: string;
  taskCount: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  readonly categories = httpResource<Category[]>(
    () => `${environment.apiBaseUrl}${API_ENDPOINTS.categories}`,
  );
}
