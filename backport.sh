git reset HEAD~1
rm ./backport.sh
git cherry-pick b8cfe19736f768f9e99defd8c234dd55bb57a98d
echo 'Resolve conflicts and force push this branch'
