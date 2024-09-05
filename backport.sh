git reset HEAD~1
rm ./backport.sh
git cherry-pick 03aff864096db3dffebd0ce869f6297cc4d4bde6
echo 'Resolve conflicts and force push this branch'
