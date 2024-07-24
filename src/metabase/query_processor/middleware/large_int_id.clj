(ns metabase.query-processor.middleware.large-int-id
  "Middleware for handling conversion of IDs to strings for proper display of large numbers"
  (:require
   [metabase.lib.metadata.protocols :as lib.metadata.protocols]
   [metabase.lib.util.match :as lib.util.match]
   [metabase.query-processor.store :as qp.store]))

(defn- ->string [x]
  (when x
    (str x)))

(defn- result-int->string
  [field-indexes rf]
  ((map (fn [row]
          (reduce #(update (vec %1) %2 ->string) row field-indexes)))
   rf))

(defn- should-convert-to-string?
  "Determines if values of the given column should be converted to strings for JavaScript safety.

  PKs and FKs which are numbers need converting, lest they lose precision. JS numbers only guarantee 52 bits."
  [{:keys [base-type semantic-type] :as _column-metadata}]
  (and (or (isa? semantic-type :type/PK)
           (isa? semantic-type :type/FK))
       (or (isa? base-type     :type/Integer)
           (isa? base-type     :type/Number))))

(defn- field-indexes [query]
  (let [fields (:fields (:query query))]
    (not-empty
     (keep-indexed
      (fn [idx val]
          ;; TODO -- we could probably fix the rest of #5816 by adding support for
          ;; `:field` w/ name and removing the PK/FK requirements -- might break
          ;; the FE client tho.
        (when-let [field (lib.util.match/match-one val
                           [:field (field-id :guard integer?) _]
                                                     ;; TODO -- can't we use the QP store here? Seems like
                                                     ;; we should be able to, but it doesn't work (not
                                                                                                    ;; initialized)
                           (lib.metadata.protocols/field (qp.store/metadata-provider) field-id))]
          (when (should-convert-to-string? field)
            idx)))
      fields))))

(defn convert-id-to-string
  "Converts any ID (:type/PK and :type/FK) in a result to a string to handle a number > 2^51
  or < -2^51, the JavaScript float mantissa. This will allow proper display of large numbers,
  like IDs from services like social media. All ID numbers are converted to avoid the performance
  penalty of a comparison based on size. NULLs are converted to Clojure nil/JS null."
  [{{:keys [js-int-to-string?] :or {js-int-to-string? false}} :middleware, :as query} rff]
  ;; currently, this excludes `:field` w/ name clauses, aggregations, etc.
  ;;
  ;; for a query like below, *no* conversion will occur
  ;;
  ;;    (mt/mbql-query venues
  ;;                 {:source-query {:source-table $$venues
  ;;                                 :aggregation  [[:aggregation-options
  ;;                                                 [:avg $id]
  ;;                                                 {:name "some_generated_name", :display-name "My Cool Ag"}]]
  ;;                                 :breakout     [$price]}})
  ;;
  ;; when you run in this fashion, you lose the ability to determine if it's an ID - you get a `:fields` value like:
  ;;
  ;;    [[:field "PRICE" {:base-type :type/Integer}] [:field "some_generated_name" {:base-type :type/BigInteger}]]
  ;;
  ;; so, short of turning all `:type/Integer` derived values into strings, this is the best approximation of a fix
  ;; that can be accomplished.
  (let [rff' (when js-int-to-string?
               (when-let [field-indexes (field-indexes query)]
                 (qp.store/store-miscellaneous-value! [::field-indexes] (set field-indexes))
                 (fn [metadata]
                   (result-int->string field-indexes (rff metadata)))))]
    (or rff' rff)))
