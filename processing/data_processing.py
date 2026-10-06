import math
import ast
import pandas as pd
import numpy as np

medal_tally = pd.read_csv('./data/Olympic_Games_Medal_Tally.csv')
games_locations = pd.read_csv('./data/Olympics_Games.csv')
results = pd.read_csv('./data/Olympic_Athlete_Event_Results.csv')

olympic_hosts = pd.read_csv('./data/olympic_hosts.csv')
print(medal_tally[~medal_tally.year.isin(olympic_hosts.game_year)])
medal_tally = medal_tally.drop(medal_tally.loc[medal_tally.year == 1906].index)

hosts = games_locations[
    (games_locations.year > 1990)
    & (games_locations.year < 2023)
].sort_values('year', ascending=True).reset_index(drop=True)

print(hosts.city.unique())
coords_rus = pd.read_csv('./data/coords.csv')

hosts = hosts[['edition', 'city', 'country_flag_url', 'year']]
hosts = hosts.merge(coords_rus, on='city', how='left')
emoji = np.where(
    hosts['edition'].str.contains('winter', case=False, na=False),
    '❄️ ',
    np.where(
        hosts['edition'].str.contains('summer', case=False, na=False),
        '☀️ ', ''
    )
)
hosts['city'] = emoji + hosts['city_ru'] + ' ' + hosts['year'].astype(str)
hosts = hosts.drop(columns=['year', 'city_ru'])
hosts = hosts.rename(columns={
    'country_flag_url': 'flag',
    'coordinates': 'coords',
})
hosts['link'] = ''
hosts['coords'] = hosts['coords'].apply(lambda x: ast.literal_eval(x))

def disperse_coordinates(coords_series, min_dist=4, iterations=50):
    """
    Раздвигает координаты, если они находятся слишком близко друг к другу
    min_dist: минимальное допустимое расстояние
    iterations: количество шагов
    """
    pts = [list(c) for c in coords_series]

    for _ in range(iterations):
        for i in range(len(pts)):
            for j in range(i + 1, len(pts)):
                dx = pts[j][0] - pts[i][0]
                dy = pts[j][1] - pts[i][1]
                dist = math.sqrt(dx*dx + dy*dy)

                if dist == 0:
                    dx, dy = 0.1, 0.1
                    dist = math.sqrt(dx*dx + dy*dy)

                if dist < min_dist:
                    overlap = min_dist - dist
                    push_x = (dx / dist) * overlap * 0.5
                    push_y = (dy / dist) * overlap * 0.5

                    pts[i][0] -= push_x
                    pts[i][1] -= push_y
                    pts[j][0] += push_x
                    pts[j][1] += push_y

    return [[round(x, 4), round(y, 4)] for x, y in pts]


hosts['coords'] = disperse_coordinates(hosts['coords'], min_dist=2.5)

noc_mapper = pd.read_csv('./data/Olympics_Country.csv')
noc_to_country = dict(zip(noc_mapper['noc'], noc_mapper['country']))

results = results[results['edition'].isin(hosts['edition'])]

if 'country' in results.columns:
    results = results.drop(columns=['country'])


results['country'] = results['country_noc'].map(noc_to_country).fillna(results['country_noc'])

results['medal'] = results['medal'].fillna('None')

ind_df = results[results['isTeamSport'] == False].copy()
team_df = results[results['isTeamSport'] == True].copy()


def get_medal_counts(df, count_col):
    base = df[[
        'edition', 'sport', 'country', count_col, 'medal']].drop_duplicates()

    total = base.groupby([
        'edition', 'sport', 'country'
        ])[count_col].nunique().reset_index(name='total')

    golds = base[base['medal'] == 'Gold'].groupby([
        'edition', 'sport', 'country'
        ])[count_col].nunique().reset_index(name='gold')
    silvers = base[base['medal'] == 'Silver'].groupby([
        'edition', 'sport', 'country'
        ])[count_col].nunique().reset_index(name='silver')
    bronzes = base[base['medal'] == 'Bronze'].groupby([
        'edition', 'sport', 'country'
        ])[count_col].nunique().reset_index(name='bronze')

    res = total.merge(golds, on=['edition', 'sport', 'country'], how='left')\
               .merge(silvers, on=['edition', 'sport', 'country'], how='left')\
               .merge(bronzes, on=['edition', 'sport', 'country'], how='left')

    res.fillna(0, inplace=True)
    res[['total', 'gold', 'silver', 'bronze']] = res[[
        'total', 'gold', 'silver', 'bronze']].astype(int)
    return res


ind_results = get_medal_counts(ind_df, 'athlete_id')
ind_results['isTeamSport'] = False

team_results = get_medal_counts(team_df, 'result_id')
team_results['isTeamSport'] = True

final_results = pd.concat([ind_results, team_results], ignore_index=True)

translations = pd.read_csv('./data/sport_ru.csv')
sport_dict = dict(zip(translations["sport"], translations["sport_ru"]))
final_results["sport"] = final_results["sport"].map(sport_dict).fillna(
    final_results["sport"])

medal_tally.to_json(
    "olympicGamesMedalTally.json",
    orient="records",
    force_ascii=False,
    indent=4
)
hosts.to_json(
    "hosts.json",
    orient="records",
    force_ascii=False,
    indent=4
)
final_results.to_json(
    "results.json",
    orient="records",
    force_ascii=False,
    indent=4
)
