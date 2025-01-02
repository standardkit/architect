import { Method } from '../constants';
import { MethodType } from '../types';

export interface RelationOptions {
  min?: number;
  max?: number;
  expose?: boolean | MethodType[];
  filterable?: boolean;
  /**
   * Enables relating existing entities by ID in create & update requests
   *
   * @example Entity
   * \@Entity()
   * class Post {
   *   \@ManyToMany(() => Tag)
   *   \@DataRelation(() => Tag, { canRelateById: true })
   *   public tags: Collection<Tag>;
   * }
   * @example Request Body
   * { tagIds: ['abc', 'def'] }
   * @example Opt-in Methods (e.g. only on create)
   * \@DataRelation(() => Tag, { canRelateById: [Method.Create] })
   * @remarks This feature is only applicable for many-to-many relations
   */
  canRelateById?: boolean | typeof Method.Create | typeof Method.Update;

  /**
   * Override for the singular name used in the request body for 'canRelateById'
   * @example Shorter name
   * \@Entity()
   * class User {
   *   \@DataRelation(() => UserCategory, { canRelateById: true, name: 'category' })
   *   public categories: Collection<UserCategory>;
   * }
   * @example Request body
   * { categoryIds: ['abc', 'def'] }
   * @remarks This feature is only applicable for many-to-many relations
   */
  name?: string;

  /**
   * Make this field required
   * @example required relation
   * \@ManyToMany(() => User)
   * \@DataRelation(() => User, { canRelateById: true, required: true })
   * public adminUsers = new Collection<User>(this);
   */
  required?: boolean | typeof Method.Create | typeof Method.Update;

  /**
   * Whether to expose this relation in the response
   * @example populate for getOne
   * \@DataRelation(() => Comment, { populate: [Method.GetOne] })
   * @example response body
   * { comments: [ { id: 'abc123' }, { id: 'def456' }] }
   */
  populate?: boolean | MethodType[];
}
