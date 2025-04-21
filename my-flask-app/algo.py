import sys
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split



#loading the data and all

try:
    df = pd.read_csv("talent.csv")
except Exception as e:
    print("Error reading CSV file:", e)
    sys.exit(1)

df.info()
sys.stdout.flush()



binary_cols = [col for col in df.columns if col.startswith("in_")]
df[binary_cols] = df[binary_cols].apply(pd.to_numeric, errors='coerce').fillna(0)
df['name'] = df['name'].astype(str).str.strip()

# handling duplicates
duplicates = df[df['name'].duplicated(keep=False)]
if not duplicates.empty:
    print("Warning: Duplicate names found:")
    print(duplicates[['name']])
    df = df.drop_duplicates(subset='name', keep='first')
    print("Dropped duplicates, keeping first occurrence.")

# cheking for  non-binary values
non_binary = [col for col in binary_cols if not df[col].isin([0, 1, np.nan]).all()]
if non_binary:
    print("Warning: Non-binary values found in columns:", non_binary)

# checking sparsity and category distribution
sparsity = (df[binary_cols] == 0).mean().mean()
sys.stdout.flush()




# Create feature matrix with 'stars' and binary columns
X = df[['stars'] + binary_cols].copy()

# Normalize the 'stars' column (avoid division by zero)
X['stars'] = (X['stars'] - X['stars'].mean()) / (X['stars'].std() + 1e-6)

# Compute weights: rarer binary features get more weight (clipped between 0 and 10)
weights = np.log1p(1 / (df[binary_cols].sum() + 1e-6)).clip(0, 10)
weights = pd.concat([pd.Series(1.0, index=['stars']), weights])

# Apply weights to the feature matrix
X_weighted = X.mul(weights)

# Compute cosine similarity between rows
similarity_matrix = cosine_similarity(X_weighted)

# Clip similarities to range [0, 1]
similarity_matrix = np.clip(similarity_matrix, 0, 1)

# Convert to DataFrame with names as labels
similarity_df = pd.DataFrame(similarity_matrix, index=df['name'], columns=df['name'])

# Warn if any names are missing from the similarity DataFrame
missing = set(df['name']) - set(similarity_df.index)
if missing:
    print(f"Warning: Missing names in similarity_df: {missing}")

# Flush output immediately
sys.stdout.flush()




def recommend_similar_items(item_name, sim_df, df, binary_cols, top_n=5):
    # Check if the item exists; if not, raise an error with example names.
    if item_name not in sim_df.index:
        raise KeyError(f"'{item_name}' not in similarity DataFrame index. Try: {list(sim_df.index[:5])}")

    # Get similarity scores for the item.
    sim_scores = sim_df.loc[item_name]

    # If duplicate entries exist, use the first one.
    if isinstance(sim_scores, pd.DataFrame):
        print(f"Warning: Multiple entries for '{item_name}'. Using first row.")
        sim_scores = sim_scores.iloc[0]

    # Remove the self-similarity score.
    sim_scores = sim_scores.drop(item_name, errors='ignore')

    # Get the top_n items with highest similarity.
    top_items = sim_scores.sort_values(ascending=False).head(top_n)

    # If scores are nearly zero, default to popular items.

    if top_items.max() < 1e-6:
        top_items = df.nlargest(top_n, 'stars')['name']
        top_items = pd.Series([0.0] * top_n, index=top_items)

    return top_items


def recommend_for_user(user_interests, X, item_names, df, top_n=5):
    # Remove any invalid interests.
    invalid_interests = [i for i in user_interests if i not in X.columns]

    if invalid_interests:
        print(f"Warning: Invalid interests {invalid_interests}. Ignoring.")
        user_interests = [i for i in user_interests if i in X.columns]

    # If no valid interests remain, return popular items.
    if not user_interests:
        print("No valid interests. Returning popular items.")
        return df.nlargest(top_n, 'stars')['name'].to_series()
    # Build a binary vector for user interests.
    user_vector = np.array([1 if col in user_interests else 0 for col in X.columns])

    # Compute cosine similarity between items and the user's interests.
    sim_scores = cosine_similarity(X, [user_vector]).flatten()
    sim_series = pd.Series(sim_scores, index=item_names)

    # Replace NaN values and boost scores based on the number of matching interests.
    sim_series = sim_series.fillna(0)
    interest_counts = df[user_interests].sum(axis=1)
    sim_series = sim_series * (1 + 0.1 * interest_counts)

    # Get the top_n recommended items.
    top_items = sim_series.sort_values(ascending=False).head(top_n)

    # If the recommendations are very low, fallback to popular items.
    if top_items.max() < 1e-6:
        print("No matching items. Returning popular items.")
        top_items = df.nlargest(top_n, 'stars')['name'].to_series()

    return top_items



def precision_at_k(item_name, sim_df, true_df, binary_cols, k=5):
    """
    Calculate precision at k: fraction of recommendations sharing a true category.
    """
    try:
        # Get top k recommendations for the item.
        recs = recommend_similar_items(item_name, sim_df, true_df, binary_cols, k)
        
        # Determine the true categories (binary features with 1) for the item.
        target_rows = true_df[true_df['name'] == item_name]
        true_cats = set(target_rows[binary_cols].columns[target_rows[binary_cols].iloc[0] == 1])
        if not true_cats:
            return 0
        
        # Count recommendations that share at least one category.
        relevant_count = 0
        for rec_name in recs.index:
            rec_rows = true_df[true_df['name'] == rec_name]
            rec_cats = set(rec_rows[binary_cols].columns[rec_rows[binary_cols].iloc[0] == 1])
            if true_cats.intersection(rec_cats):
                relevant_count += 1
        
        return relevant_count / k
    except KeyError:
        return 0


        
def compute_coverage(sim_df, df, binary_cols, top_n=5):
    
    #Computing coverage, which is the proportion of items that appear in any recommendation list.
    
    all_recs = set()
    for name in df['name']:
        try:
            # Get recommendations for each item.
            recs = recommend_similar_items(name, sim_df, df, binary_cols, top_n)
            all_recs.update(recs.index)
        except KeyError:
            continue
    return len(all_recs) / len(df) if len(df) > 0 else 0


def intra_list_similarity(rec_names, sim_df):
    # cmputing average cosine similarity among all unique pairs in a recommendation list.
    
    if len(rec_names) < 2:
        return 0
    sim_scores = [sim_df.loc[n1, n2]
                  for i, n1 in enumerate(rec_names)
                  for n2 in rec_names[i+1:]]
    return np.mean(sim_scores) if sim_scores else 0



