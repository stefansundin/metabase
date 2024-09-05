git reset HEAD~1
rm ./backport.sh
git cherry-pick 05e02e511dc7ae93758da57d524d008019540093
echo 'Resolve conflicts and force push this branch'
